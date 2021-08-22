using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Object : MonoBehaviour
{

    public bool isbreakable = false;
    public float health;

    public void OnHit (float damage) {
        health -= damage;
        if (isbreakable && health <= 0f) {
            Break();
        }
    }

    void Break() {
        Destroy(gameObject);
    }
}
