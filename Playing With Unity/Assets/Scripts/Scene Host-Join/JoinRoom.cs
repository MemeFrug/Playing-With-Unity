using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Mirror;
using TMPro;

public class JoinRoom : MonoBehaviour
{
    public string defaultipaddress = "42.241.255.248";

    public TMP_InputField textmeshproinput;

    private void Start() {
        NetworkManager.singleton.networkAddress = defaultipaddress; 
        textmeshproinput.text = defaultipaddress;  
    }

    public void ValueChangeCheck(string ipaddress)
    {
        NetworkManager.singleton.networkAddress = ipaddress;
    }

    public void JoinClient() {
        string networkaddresscheck = NetworkManager.singleton.networkAddress.Replace(" ", string.Empty);
        if (networkaddresscheck != "")
            NetworkManager.singleton.StartClient();
    }
}
