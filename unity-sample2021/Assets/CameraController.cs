using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraController : MonoBehaviour
{
    void Start()
    {
    }

    void Update()
    {
    }

    public void SetFOV(float fov)
    {
        Camera.main.fieldOfView = fov;
        Debug.Log("SetFOV:" + fov);
    }
}
