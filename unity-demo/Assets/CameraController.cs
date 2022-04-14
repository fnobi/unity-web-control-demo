using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraController : MonoBehaviour
{
    [SerializeField, Range(0.0f, 360.0f)]
    private float angle = 0.0f;

    [SerializeField]
    private float distance = 4.0f;

    [SerializeField]
    private GameObject target;

    private float initialY = 0.0f;


    void Start()
    {
        initialY = transform.position.y;
    }

    void Update()
    {
        float r = Mathf.PI * angle / 180;
        transform.position = new Vector3(
            Mathf.Sin(r) * distance,
            initialY,
            Mathf.Cos(r) * distance
        );
        transform.LookAt(target.transform);
    }

    public void SetAngle(float v)
    {
        angle = v;
    }
}
