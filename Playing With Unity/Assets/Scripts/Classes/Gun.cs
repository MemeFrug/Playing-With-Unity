using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class Gun : MonoBehaviour
{

    public Player Player;
    public Transform BulletShootPos;
    public Transform Rotation;

    public ParticleSystem muzzleflash;

    public Transform CrossHairTarget;

    public float damage = 10f;
    public float range = 200f;

    public float impactforce = 30f;

    public bool isshooting = false;

    public float nextTimeToFire = 0f;
    public float fireRate = 9f;

    public int ammo = 30;

    public int ammoHolding = 560;

    public int MaxAmmo;

    public float timetakestoreload = 1f;
    public bool isreloading = false;

    public TMP_Text AmmoUI;

    private Coroutine reloadco;

    public float bulletSpeed = 1000.0f;
    public float bulletDrop = 10.0f;

    public float MaxLifeTime = 3.0f;

    public Vector3 ZoomPos;

    private Vector3 originalPos;

    // public bool allowedtoshoot = true;

    // //Laymerask for checking if in wall
    // public LayerMask layermaskguninwall;

    private void Awake() {
        MaxAmmo = ammo;
        originalPos = transform.position;

        AmmoUI = GameObject.FindWithTag("AmmoCount").GetComponent<TMP_Text>();
    }

    public void shootmouseup() {
        isshooting = false;
    }

    private void Update() {
        if (!Player.isLocalPlayer) return;

        //Allowed to shoot
        // RaycastHit RayInfo;

        if (Input.GetMouseButtonDown(0)) {
            // if (Physics.Raycast(BulletShootPos.position, (BulletShootPos.position - Player.myCam.transform.position).normalized, out RayInfo, Vector3.Distance(BulletShootPos.position, Player.myCam.transform.position), layermaskguninwall)) {
            //     Debug.LogWarning("In a wall right now please implement a better way of doing this");
            //     Debug.Log("Gun Is In A Wall");
            //     Debug.DrawRay(BulletShootPos.position, -(BulletShootPos.position - Player.myCam.transform.position).normalized, Color.red, Mathf.Infinity);

            //     allowedtoshoot = false;
            //     return;
            // }
            // Debug.DrawRay(BulletShootPos.position, -(BulletShootPos.position - Player.myCam.transform.position).normalized, Color.green, Mathf.Infinity);
            // allowedtoshoot = true;
            shoot();
        }

        if (Input.GetMouseButtonDown(1)) {
            Debug.Log("Scoping");
            transform.position = ZoomPos;
        } else if (Input.GetMouseButtonUp(1)){
            transform.position = originalPos;
            Debug.Log(originalPos);
        }

        
        else if (Input.GetMouseButtonUp(0)) {
            shootmouseup();
        }

        if (Input.GetKeyDown(KeyCode.R)) {
            reload();
        }

        if (isshooting && Time.time >= nextTimeToFire && !isreloading) {
            nextTimeToFire = Time.time + 1f/fireRate;
            //Shoot
            if (ammo > 0) {
                ammo--;
                Update_Ui();
                Player.CmdShootBullet(damage, BulletShootPos.position, impactforce, bulletDrop, bulletSpeed, MaxLifeTime);
            }
            else reload();
        }
    }

    public void Update_Ui() {
        AmmoUI.text = $"{ammo}/{ammoHolding}";
    }

    public void shoot() {
        isshooting = true;
        Player.MuzzleFlash = muzzleflash;
    }

    public void reload() {
        if (ammo >= MaxAmmo || isreloading || ammoHolding <= 0) return;

        AmmoUI.text = $"Reloading";

        isreloading = true;
        reloadco = StartCoroutine(reload_wait());
    }

    private void OnEnable() {
        Update_Ui();
    }

    private void OnDisable() {
        isreloading = false;
        isshooting = false;
        AmmoUI.text = $"0/0";
        if (reloadco != null) StopCoroutine(reloadco);
    }

    IEnumerator reload_wait() {
        yield return new WaitForSeconds(timetakestoreload);
        if (ammoHolding <= MaxAmmo) {
            ammo = ammoHolding;
            ammoHolding = 0;
        }else {
            ammoHolding = ammoHolding - (MaxAmmo - ammo);
            ammo = MaxAmmo;
        }
        isreloading = false;
        Update_Ui();
    }
}
