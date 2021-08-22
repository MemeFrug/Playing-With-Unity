using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class ChangeUsername : MonoBehaviour
{
    public TMP_Text Username;

    public string username;

    private void Start() {
        string playerprefusername = PlayerPrefs.GetString("username", "Player Name");
        username = playerprefusername.ToString();
        Username.text = playerprefusername.ToString();
    }

    public void ChangeName(string NewName) {
        Debug.Log(NewName);
        Username.text = NewName.ToString();
        username = NewName;
    }

    public void CheckIfEmpty() {
        string check = username.Replace(" ", string.Empty);
        if (check == "") {
            Username.text = "Player Name";
            username = "Player Name";
            Debug.Log("True");
        }
        PlayerPrefs.SetString("username", username.ToString());
        PlayerPrefs.Save();
    }
}
