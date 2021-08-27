// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

// Unlit map preview shader. Based on Unity's "Unlit/Texture".
// - no lighting
// - no lightmap support
// - no per-material color
// - no fog
Shader "nu Assets/Easy Flares/Unlit/BackdropShader"
{

	Properties 
	{
		_MainTex ("Base (RGBA)", 2D) = "white" {}
	}

	SubShader 
	{
		Tags { "Queue"="Transparent" }
		LOD 100
		Blend SrcAlpha OneMinusSrcAlpha
		ZWrite Off
		Pass 
		{  
			CGPROGRAM
				#pragma vertex vert
				#pragma fragment frag
			
				#include "UnityCG.cginc"

				struct appdata_t 
				{
					float4 vertex : POSITION;
					float2 texcoord : TEXCOORD0;
				};

				struct v2f 
				{
					float4 vertex : SV_POSITION;
					half2 texcoord : TEXCOORD0;
				};

				sampler2D _MainTex;
				float4 _MainTex_ST;

				half _TileX;
				half _TileY;

			
				v2f vert (appdata_t v)
				{
					v2f o;
					o.vertex = UnityObjectToClipPos(v.vertex);
					o.texcoord = v.texcoord;
					return o;
				}
			
				fixed4 frag (v2f i) : SV_Target
				{
					half2 offset = half2(_TileX, _TileY);
					half2 uv = i.texcoord * offset;	

					fixed4 col = tex2D(_MainTex, uv);
					col.a = col.a > 0 ? col.a * 0.3 : 0;
					col.rgb = lerp(col.rgb, (half3)(0), 1 - col.a);
					col.a = 1;


					return col;
				}
			ENDCG
		}
	}
}
