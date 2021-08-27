using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraScript : MonoBehaviour
{
    public GameObject Head;

    // Update is called once per frame
    void Update()
    {
        Head.transform.rotation = transform.rotation;
    }
}
