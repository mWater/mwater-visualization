module.exports = {
    "table": "entities.water_point",
    "showRowNumbers": true,
    "columns": [
        {
            "id": "31e3afda-35bd-488a-902d-34a301873d52",
            "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "type"
            },
            "type": "expr",
            "label": null,
            "width": 150
        },
        {
            "id": "bc3ad4cc-65d6-4a44-a4e5-2d6cf7b37711",
            "expr": {
                "expr": {
                    "type": "field",
                    "table": "admin_regions",
                    "column": "full_name"
                },
                "type": "scalar",
                "joins": [
                    "admin_region"
                ],
                "table": "entities.water_point"
            },
            "type": "expr",
            "label": null,
            "width": 150
        },
        {
            "id": "3fb0f1c0-ca4c-4704-90d8-a7044daf6d1c",
            "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "code"
            },
            "type": "expr",
            "label": null,
            "width": 150
        },
        {
            "id": "7b5d157a-c44a-4031-abe8-2b43acae000a",
            "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "about"
            },
            "type": "expr",
            "label": null,
            "width": 150
        },
        {
            "id": "8a4a3d23-65fa-4e7e-9c8a-077954ce26c9",
            "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "alt_id"
            },
            "type": "expr",
            "label": null,
            "width": 150
        },
        {
            "id": "31ac2483-a903-4c81-ace4-7b72353d6338",
            "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "drilling_method"
            },
            "type": "expr",
            "label": null,
            "width": 150
        },
        {
            "id": "ed46bac2-2afc-42c3-8cdc-9a392bd70fda",
            "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "drilling_method_other"
            },
            "type": "expr",
            "label": null,
            "width": 150
        },
        {
            "id": "da0d823a-6efb-4513-b8a3-a3cf1f9f4b0f",
            "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "installation_date"
            },
            "type": "expr",
            "label": null,
            "width": 150
        },
        {
            "id": "8368be53-48d8-4e85-a507-beea2a68bf35",
            "expr": {
                "type": "field",
                "table": "entities.water_point",
                "column": "tz_wpms_id"
            },
            "type": "expr",
            "label": null,
            "width": 150
        }
    ]
}