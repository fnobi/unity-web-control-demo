using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraController : MonoBehaviour
{
    private float rotationX = 0;
    private float rotationY = 0;
    private float rotationZ = 0;

    void Start()
    {
    }

    void Update()
    {
    }

    public void SetRotationX(float x)
    {
        this.rotationX = x;
        Debug.Log("SetRotationX:" + x);
    }
    public void SetRotationY(float y)
    {
        this.rotationY = y;
        Debug.Log("SetRotationY:" + y);
    }
    public void SetRotationZ(float z)
    {
        this.rotationZ = z;
        Debug.Log("SetRotationZ:" + z);
    }
    public void ApplyRotation()
    {
        Vector3 v = new Vector3(rotationX, rotationY, rotationZ);
        transform.eulerAngles = v;
        Debug.Log("ApplyRotation:" + v);
    }
}
