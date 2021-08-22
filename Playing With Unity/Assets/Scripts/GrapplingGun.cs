using UnityEngine;
using System.Collections.Generic;
using TMPro;

public class GrapplingGun : MonoBehaviour {

    public Player playerGameobject;

    public bool islocalplayer = false;

    private LineRenderer Laser;

    private Vector3 grapplePoint;
    public LayerMask whatIsGrappleable;
    public Transform gunTip, playercamera, player;
    private float maxDistance = 100f;
    private SpringJoint joint;

    public float spring = 4.5f;
    public float damper = 7f;
    public float massScale = 4.5f;

    public float grapplecooldown = 0.15f;
    private bool allowedtograpple = true;

    public float Ammo = Mathf.Infinity;
    public float MaxAmmo;

    //UI
    private TMP_Text AmmoUI;

    private void Awake() {
        Laser = GetComponent<LineRenderer>();

        AmmoUI = GameObject.FindWithTag("AmmoCount").GetComponent<TMP_Text>();

        MaxAmmo = Ammo;
    }

    void Start() {
        islocalplayer = player.transform.GetComponent<Player>().islocal;
        playerGameobject.grappleGun = gameObject;
    }

    private void Update() {
        if (PauseMenu.GameIsPaused || !islocalplayer) return;

        if (Input.GetMouseButtonDown(0)) {
            shoot();
        }

        else if (Input.GetMouseButtonUp(0)) {
            shootmouseup();
        }
    }

    private void OnDisable() {
        StopGrapple();
    }
    
    public void Update_UI() {
        if (MaxAmmo == Mathf.Infinity) 
        AmmoUI.text = "";
        else 
        AmmoUI.text = $"{Ammo}/{MaxAmmo}";
    }

    private void OnEnable() {
        Update_UI();
    }

    public void shoot() {

        if (!allowedtograpple || PauseMenu.GameIsPaused || Ammo <= 0) return;

        Ammo--;

        Update_UI();

        playerGameobject.grappleGun = gameObject;
        playerGameobject.CmdStartGrapple(playercamera.position, playercamera.forward, maxDistance, whatIsGrappleable);
        allowedtograpple = false;
        Invoke(nameof(ReadyToGrapple), grapplecooldown);
    }

    public void shootmouseup() {
        playerGameobject.CmdStopGrapple();
    }

    //Called after Update
    void LateUpdate() {
        DrawRope();
    }

    private Vector3 currentGrapplePosition;
    
    void DrawRope() {
        if (!joint) return;
        currentGrapplePosition = Vector3.Lerp(currentGrapplePosition, grapplePoint, Time.deltaTime * 8f);

        Laser.positionCount = 2;
        Laser.startWidth = 0.07f;
        Laser.endWidth = 0.07f;
        Laser.SetPosition(0, gunTip.position);
        Laser.SetPosition(1, currentGrapplePosition);
    }

    void ReadyToGrapple() {
        allowedtograpple = true;
    }

    public bool IsGrappling() {
        return joint != null;
    }

    public Vector3 GetGrapplePoint() {
        return grapplePoint;
    }

    
    List<SpringJoint> AllJoints = new List<SpringJoint>();

    //The Networking is found in Player.cs
    public void StopGrapple() {
        Laser.positionCount = 0;
        var Joint = AllJoints;
        foreach (var item in Joint) {
            DestroyImmediate(item, true);   
        }
        AllJoints = new List<SpringJoint>();
    }

    //The Networking is found in Player.cs
    public void raycastGrapple(Vector3 point) {
        grapplePoint = point;
        joint = player.gameObject.AddComponent<SpringJoint>();
        joint.autoConfigureConnectedAnchor = false;
        joint.connectedAnchor = grapplePoint;

        float distanceFromPoint = Vector3.Distance(player.position, grapplePoint);

        //The distance grapple will try to keep from grapple point. 
        // joint.maxDistance = distanceFromPoint * 0.8f;
        // joint.minDistance = distanceFromPoint * 0.25f;

        //Adjust these values to fit your game.
        joint.spring = spring;
        joint.damper = damper;
        joint.massScale = massScale;

        AllJoints.Add(joint);
            
        currentGrapplePosition = gunTip.position;
    }
}