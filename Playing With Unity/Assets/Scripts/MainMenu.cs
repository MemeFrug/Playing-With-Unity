using System.Collections.Generic;
using Mirror;
using UnityEngine;
using UnityEngine.Audio;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class MainMenu : MonoBehaviour
{

    public GameObject levelloader;

    [Scene] [SerializeField] private string SceneToGoTo = string.Empty;
    public float transitionTime = 1f;

    //Main Menu Functionality
    public void PlayGame () {
        SceneManager.LoadScene(SceneToGoTo);
    }

    public void QuitGame () {
        Debug.Log("Quiting Application");
        Application.Quit();
    }

    //Settings Menu

    //Volume
    public AudioMixer audioMixer;

    public Dropdown resolutionDropdown;

    Resolution[] resolutions;

    void Start() {
        resolutions = Screen.resolutions;

        resolutionDropdown.ClearOptions();

        List<string> options = new List<string>();

        int currentResolutionIndex = 0;
        for (int i = 0; i < resolutions.Length; i++)
        {
            Debug.Log("Yes");
            string option = resolutions[i].width + " x " + resolutions[i].height;
            options.Add(option);

            if (resolutions[i].width == Screen.currentResolution.width && resolutions[i].height == Screen.currentResolution.height) {
                currentResolutionIndex = i;
            }
        }

        resolutionDropdown.AddOptions(options);
        resolutionDropdown.value = currentResolutionIndex;
        resolutionDropdown.RefreshShownValue();
    }

    public void SetVolume (float volume) {
        Debug.Log(volume);
        audioMixer.SetFloat("volume", volume);
    }

    //Graphics
    public void SetQuality(int qualityIndex) {
        QualitySettings.SetQualityLevel(qualityIndex);
    }

    //Fullscreen
    public void SetFullscreen (bool isFullscreen) {
        Screen.fullScreen = isFullscreen;
    }

    public void SetResolution (int resolutionIndex) {
        Resolution resolution = resolutions[resolutionIndex];
        Screen.SetResolution(resolution.width, resolution.height, Screen.fullScreen);
    }
}
