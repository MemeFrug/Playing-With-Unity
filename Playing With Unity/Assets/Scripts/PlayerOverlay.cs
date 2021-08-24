using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using Mirror;

public class PlayerOverlay : MonoBehaviour
{
    public TMP_Text FPSUI;
    public TMP_Text PingUI;

    private int m_frameCounter = 0;
    private float m_timeCounter = 0.0f;
    private float m_lastFramerate = 0.0f;
    public float m_refreshTime = 0.5f;

    //Ping
    private float ping = 0;

    void Update()
    {
        if( m_timeCounter < m_refreshTime )
        {
            m_timeCounter += Time.deltaTime;
            m_frameCounter++;
        }
        else
        {
            //----- FPS

            //This code will break if you set your m_refreshTime to 0, which makes no sense.
            m_lastFramerate = (float)m_frameCounter/m_timeCounter;
            m_frameCounter = 0;
            m_timeCounter = 0.0f;

            var m_intLastFramerate = (int)Mathf.Round(m_lastFramerate);

            FPSUI.text = $"FPS: {m_intLastFramerate.ToString()}";

            //Ping
            if (!NetworkClient.active) return;
            ping = Mathf.Round((float)NetworkTime.rtt * 1000);
            PingUI.text = $"Ping: {ping}ms";

        }
    }
}
