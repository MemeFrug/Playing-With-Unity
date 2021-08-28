using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DisableEnable : MonoBehaviour
{
    public Player Player;
    public GameObject Neck;


    // Start is called before the first frame update
    void Start()
    {
        if (Player.isLocalPlayer) {
            Neck.transform.localScale = Vector3.zero;
        }
    }
}
