using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Mirror;
using TMPro;


public class Player : NetworkBehaviour
{
    public bool islocal = true;
    public Camera myCam;
    public AudioListener AudioListener;

    public GameObject WeaponHolder;

    public float PlayersHealth = 100f;

    // Start is called before the first frame update
    void Start()
    {
        islocal = isLocalPlayer;

        if (!isLocalPlayer) {
            WeaponHolder.layer = 0;
            var children = WeaponHolder.GetComponentsInChildren<Transform>(true);
            for(int i = 0, max = children.Length; i < max; i++)
            {
                Transform child = children[i];
                child.gameObject.layer = 0;
            }

        }else OnWeaponChanged(selectedWeaponLocal, selectedWeaponLocal);
    }

    void Update()
    {
        if (!isLocalPlayer)
        {
            // make non-local players run this
            floatingInfo.transform.LookAt(Camera.main.transform);
            return;
        }

        if (PlayersHealth <= 0) Respawn("Health Went Below 0");

        //Only the client that owns this object executes this code
        if (myCam.enabled == false)
            myCam.enabled = true;

        if (AudioListener.enabled == false)
            AudioListener.enabled = true;

        if (PauseMenu.GameIsPaused) return;

        if (Input.GetAxisRaw("Mouse ScrollWheel") > 0f)
        {   
            selectedWeaponLocal--;

            if (selectedWeaponLocal < 0){
                selectedWeaponLocal = weaponArray.Length - 1;
            }

            Update_Inventory();

            CmdChangeActiveWeapon(selectedWeaponLocal);
        }
        else if (Input.GetAxisRaw("Mouse ScrollWheel") < 0f) {
            selectedWeaponLocal++;

            if (selectedWeaponLocal > weaponArray.Length - 1) 
            {
                selectedWeaponLocal = 0; 
            }

            Update_Inventory();

            CmdChangeActiveWeapon(selectedWeaponLocal);
        }
    }

    public void Respawn(string reason) {
        Debug.Log("Died Because: "+reason);

        GameObject respawn = GameObject.FindWithTag("Respawn");
        transform.position = respawn.transform.position;
    }

    public TextMesh playerNameText;
    public GameObject floatingInfo;

    private Material playerMaterialClone;

    [SyncVar(hook = nameof(OnNameChanged))]
    public string playerName;

    [SyncVar(hook = nameof(OnColorChanged))]
    public Color playerColor = Color.white;

    void OnNameChanged(string _Old, string _New)
    {
        playerNameText.text = playerName;
    }

    void OnColorChanged(Color _Old, Color _New)
    {
        playerNameText.color = _New;
        playerMaterialClone = new Material(GetComponent<Renderer>().material);
        playerMaterialClone.color = _New;
        GetComponent<Renderer>().material = playerMaterialClone;
    }

    public override void OnStartLocalPlayer()
    {
        floatingInfo.transform.localPosition = new Vector3(0, -0.3f, 0.6f);
        floatingInfo.transform.localScale = new Vector3(0.1f, 0.1f, 0.1f);
        floatingInfo.SetActive(false);

        string name = PlayerPrefs.GetString("username", "Player Name");
        Color color = new Color(Random.Range(0f, 1f), Random.Range(0f, 1f), Random.Range(0f, 1f));
        CmdSetupPlayer(name, color);
    }

    [Command]
    public void CmdSetupPlayer(string _name, Color _col)
    {
        // player info sent to server, then server updates sync vars which handles it on all clients
        playerName = _name;
        playerColor = _col;
    }

    //Inventorys
    //Set to private after testing
    private int selectedWeaponLocal = 0;
    public GameObject[] weaponArray;

    [SyncVar(hook = nameof(OnWeaponChanged))]
    public int activeWeaponSynced = 0;

    void OnWeaponChanged(int _Old, int _New){
        // disable old weapon
        // in range and not null
        if (_Old >= 0 && _Old <= weaponArray.Length - 1 && weaponArray[_Old] != null)
        {   
            weaponArray[_Old].SetActive(false);
        }
        
        // enable new weapon
        // in range and not null
        if (_New >= 0 && _New <= weaponArray.Length - 1 && weaponArray[_New] != null)
        {   
            weaponArray[_New].SetActive(true);
        }
    }

    [Command]
    public void CmdChangeActiveWeapon(int newIndex)
    {
        activeWeaponSynced = newIndex;
    }
    RectTransform[] InventoryChildrenUI;

    void Awake() 
    { 
        InventoryChildrenUI = GameObject.FindWithTag("Inventory").GetComponentsInChildren<RectTransform>();
        Update_Inventory();
    }

    public void Update_Inventory() {
        var i = 0;
        foreach (var e in weaponArray)
        {
            i++;
            var name = e.name;
            InventoryChildrenUI[i].GetComponentInChildren<TMP_Text>().text = $"{name} .{i}";
            if (i - 1 == selectedWeaponLocal) InventoryChildrenUI[i].GetComponentInChildren<TMP_Text>().color = new Color(0f,0f,0f, 1f);
            else InventoryChildrenUI[i].GetComponentInChildren<TMP_Text>().color = new Color(1f,1f,1f, 1f);

            Debug.Log(i-1);
            Debug.Log(selectedWeaponLocal);
        }
    }

    //Normal Networking stuff
    [Command]
    public void CmdStartGrapple(Vector3 position, Vector3 forward, float maxDistance, int whatIsGrappleable) {
        RaycastHit hit;
        if (Physics.Raycast(position, forward, out hit, maxDistance, whatIsGrappleable)) {
            var point = hit.point;
            RpcStartGrapple(point);
        }
    }

    [Command]
    public void CmdStopGrapple() {
        RpxStopGrapple();
    }

    /// <summary>
    /// Call whenever we want to stop a grapple
    /// </summary>

    public GameObject grappleGun;

    [ClientRpc]
    void RpxStopGrapple() {
        if (grappleGun == null) return;
        grappleGun.GetComponent<GrapplingGun>().StopGrapple();   
    }


    /// <summary>
    /// Call whenever we want to start a grapple
    /// </summary>
    [ClientRpc]
    void RpcStartGrapple(Vector3 hit)
    {
        if (grappleGun == null) return;
        grappleGun.GetComponent<GrapplingGun>().raycastGrapple(hit);
    }


    //GUNS/BULLETS

    public TrailRenderer bulletTrail;

    //Need to make it dependant on what surface
    public GameObject BulletImpact;

    public GameObject DefaultBulletImpact;

    //This will be changed by code when selected gun is acquired
    public ParticleSystem MuzzleFlash;

    public Transform raycastDestination;

    class Bullet {
        public float time;
        public Vector3 initialPosition;
        public Vector3 initialVelocity;
        public TrailRenderer tracer;

        public float damage;
        public float ForceAdd;
        public float bulletDrop;

        public float MaxLifeTime;

        public float bulletSpeed;
    }

    List<Bullet> bullets = new List<Bullet>();

    Vector3 GetPosition(Bullet bullet) {
        //p + v*t + 0.5*g*t*t
        Vector3 gravity = Vector3.down * bullet.bulletDrop;
        return (bullet.initialPosition) + (bullet.initialVelocity*bullet.time) + (0.5f * gravity * bullet.time * bullet.time);
    }

    Bullet CreateBullet(Vector3 position, Vector3 velocity, float damage, float ForceAdd, float bulletDrop, float MaxLifeTime, float bulletSpeed) {
        Bullet bullet = new Bullet();
        bullet.initialPosition = position;
        bullet.initialVelocity = velocity;
        bullet.time = 0.0f;
        bullet.tracer = NetworkManager.Instantiate(bulletTrail, position, Quaternion.identity);
        bullet.tracer.AddPosition(position);

        bullet.damage = damage;
        bullet.ForceAdd = ForceAdd;
        bullet.bulletDrop = bulletDrop;

        bullet.MaxLifeTime = MaxLifeTime;

        bullet.bulletSpeed = bulletSpeed;
        return bullet;
    }

    private void LateUpdate() {
        SimulateBullets(Time.deltaTime);
        DestroyBullets();
    }

    void SimulateBullets(float deltaTime) {
        bullets.ForEach(bullet => {
            Vector3 p0 = GetPosition(bullet);
            bullet.time += deltaTime;
            Vector3 p1 = GetPosition(bullet);
            RaycastSegment(p0, p1, bullet);
        });
    }

    void DestroyBullets() {
        bullets.RemoveAll(bullet => bullet.time >= bullet.MaxLifeTime);
    }

    void RaycastHit(Bullet bullet, RaycastHit hit) {
        if (hit.rigidbody != null) hit.rigidbody.AddForceAtPosition(myCam.transform.forward * bullet.ForceAdd, hit.point);

        bullet.tracer.transform.position = hit.point;
        bullet.time += Time.deltaTime + 2;

        if (hit.transform.GetComponent<BulletImpact>() != null) {
            BulletImpact = hit.transform.GetComponent<BulletImpact>().BulletImpactParticle;
        } else BulletImpact = null;

        Object component;
        if (hit.transform.GetComponent<Object>() != null) {
            component = hit.transform.GetComponent<Object>();
        }

        if (hit.transform.GetComponent<Player>() != null) {
            hit.transform.GetComponent<Player>().PlayersHealth -= bullet.damage;
        }

        RpcBulletImpact(hit.point, hit.normal);
    }

    void RaycastSegment(Vector3 start, Vector3 end, Bullet bullet) {
        Vector3 direction = end - start;
        float distance = (end - start).magnitude;

        ray = new Ray(start, direction);
        if (Physics.Raycast(ray, out hit, distance)) {
            if (hit.collider.gameObject.GetComponent<Player>() != null) {
                if (hit.collider.gameObject.GetComponent<Player>().isLocalPlayer) {
                    if (bullet.tracer != null) bullet.tracer.transform.position = end;
                    return;
                }
            }

            //Create a dust and bullet hole with movement of rigidbodys
            RaycastHit(bullet, hit);
            
        }else {
            
            if (bullet.tracer != null) bullet.tracer.transform.position = end;
        }
    }

    Ray ray;
    RaycastHit hit;

    [Command]
    public void CmdShootBullet(float damage, Vector3 position, float ForceAdd, float bulletDrop, float bulletSpeed, float MaxLifeTime) {
        RpcBeforeShootBullet(position, bulletSpeed, damage, ForceAdd, bulletDrop, MaxLifeTime);
    }

    
    public Animator animator;

    [ClientRpc]
    public void RpcShootingMouseUp() {
        //Do animations
             
    }

    [ClientRpc]
    public void RpcBeforeShootBullet(Vector3 position, float bulletSpeed, float damage, float ForceAdd, float bulletDrop, float MaxLifeTime){
        //Show muzzle flash
        MuzzleFlash.Play();

        animator.SetBool("Shooting", true);

        //show bullet here
        Vector3 velocity = (raycastDestination.position - position).normalized * bulletSpeed;
        var bullet = CreateBullet(position, velocity, damage, ForceAdd, bulletDrop, MaxLifeTime, bulletSpeed);
        bullets.Add(bullet);
    }

    [ClientRpc]
    public void RpcBulletImpact(Vector3 hitpoint, Vector3 hitnormal) {
        //Make this all spawn on the server not on the clients (its eisier)

        if (BulletImpact == null) {
            Debug.LogWarning("The Object you just shot does not have a BulletImpact Component please add");
            GameObject hole = Instantiate(DefaultBulletImpact, hitpoint, Quaternion.LookRotation(hitnormal));
            hole.transform.localPosition += .01f*hitnormal;
            hole.transform.parent = hit.transform;
        }
        else {
            GameObject hole = Instantiate(BulletImpact, hitpoint, Quaternion.LookRotation(hitnormal));
            hole.transform.localPosition += .01f*hitnormal;
            hole.transform.parent = hit.transform;
        }
    }
}

