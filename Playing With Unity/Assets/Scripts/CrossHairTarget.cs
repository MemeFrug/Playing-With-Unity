using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CrossHairTarget : MonoBehaviour
{
    public Player player;
    public Camera mainCamera;
    Ray ray;
    RaycastHit hitInfo;

    // Update is called once per frame
    void Update()
    {
        if (!player.isLocalPlayer) return;

        ray.origin = mainCamera.transform.position + mainCamera.transform.forward * 3;
        ray.direction = mainCamera.transform.forward;
        if(Physics.Raycast(ray, out hitInfo)) {
            transform.position = hitInfo.point;
            return;
        }
        transform.position = mainCamera.transform.position + mainCamera.transform.forward * 100;
    }
}
