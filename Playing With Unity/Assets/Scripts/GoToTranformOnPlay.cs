using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GoToTranformOnPlay : MonoBehaviour
{
    public Transform Goto;

    // Start is called before the first frame update
    void Start()
    {
        transform.parent = Goto;
        transform.localPosition = Goto.position;
        transform.rotation = Goto.rotation;
    }
}
