using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraController : MonoBehaviour
{
    private float quaternionX = 0;
    private float quaternionY = 0;
    private float quaternionZ = 0;
    private float quaternionW = 0;

    void Start()
    {
    }

    void Update()
    {
    }

    public void SetPositionX(float x)
    {
        transform.position = new Vector3(
            x,
            transform.position.y,
            transform.position.z
        );
        Debug.Log("SetPositionX:" + x);
    }

    public void SetPositionY(float y)
    {
        transform.position = new Vector3(
            transform.position.x,
            y,
            transform.position.z
        );
        Debug.Log("SetPositionY:" + y);
    }

    public void SetPositionZ(float z)
    {
        transform.position = new Vector3(
            transform.position.x,
            transform.position.y,
            z
        );
        Debug.Log("SetPositionZ:" + z);
    }

    public void SetQuaternionX(float x)
    {
        this.quaternionX = x;
        Debug.Log("SetQuaternionX:" + x);
    }
    public void SetQuaternionY(float y)
    {
        this.quaternionY = y;
        Debug.Log("SetQuaternionY:" + y);
    }
    public void SetQuaternionZ(float z)
    {
        this.quaternionZ = z;
        Debug.Log("SetQuaternionZ:" + z);
    }
    public void SetQuaternionW(float w)
    {
        this.quaternionW = w;
        Debug.Log("SetQuaternionW:" + w);
    }
    public void ApplyQuaternion()
    {
        Quaternion q = new Quaternion(quaternionX, quaternionY, quaternionZ, quaternionW);
        transform.rotation = q;
        Debug.Log("ApplyQuaternion:" + transform.rotation);
    }
}
