const tasks = JSON.parse(`{
    "categories": {
      "new": {
        "cls": "info",
        "name": "Полученные",
        "items": {
          "nakladka-1.5mm.ncp": {
            "id": 4,
            "status": "ready",
            "timestamp": "2022/12/14, 15:02:24",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 490,
                "dimy": 380,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "Test",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "nakladka-1.5mm",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/nakladka-1.5mm/nakladka-1.5mm.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "3000x1500-10.0-DD11-N1.ncp": {
            "id": 8,
            "status": "ready",
            "timestamp": "2022/12/14, 15:02:24",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 10,
                "formattype": "Sheet",
                "dimx": 3000,
                "dimy": 1500,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "Test",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "3000x1500-10.0-DD11-N1",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/3000x1500-10.0-DD11-N1/3000x1500-10.0-DD11-N1.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "xyu2.ncp": {
            "id": 9,
            "status": "ready",
            "timestamp": "2022/12/14, 15:02:24",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 206,
                "dimy": 184,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "xyu2",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/xyu2/xyu2.svg\" />",
            "success_count": 2,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "3000x1500-10.0-DD11-N0.ncp": {
            "id": 10,
            "status": "ready",
            "timestamp": "2022/12/14, 15:02:24",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 10,
                "formattype": "Sheet",
                "dimx": 3000,
                "dimy": 1500,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "Test",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "3000x1500-10.0-DD11-N0",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/3000x1500-10.0-DD11-N0/3000x1500-10.0-DD11-N0.svg\" />",
            "success_count": 0,
            "state": {
              "current_contour": false,
              "sheet_position": false
            },
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "Test.ncp": {
            "id": 11,
            "status": "ready",
            "timestamp": "2022/12/14, 15:02:24",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 4,
                "formattype": "Sheet",
                "dimx": 102,
                "dimy": 101,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "test_flan",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "Test",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/Test/Test.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "5987.ncp": {
            "id": 12,
            "status": "ready",
            "timestamp": "2022/12/14, 15:02:24",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 4,
                "formattype": "Sheet",
                "dimx": 2980,
                "dimy": 1490,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "5987",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/5987/5987.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "скругления.ncp": {
            "id": 15,
            "status": "ready",
            "timestamp": "2022/12/16, 11:11:42",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Stainless Steel",
                "materialcode": 1.4301,
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 100,
                "dimy": 100,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "скругления",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/скругления/скругления.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "uzor.ncp": {
            "id": 18,
            "status": "ready",
            "timestamp": "2023/04/03, 14:42:14",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 2,
                "formattype": "Sheet",
                "dimx": 621,
                "dimy": 1051,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "uzor",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/uzor/uzor.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "rounded.ncp": {
            "id": 19,
            "status": "ready",
            "timestamp": "2023/05/03, 16:23:42",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 192,
                "dimy": 221,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "127-Logotip",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "rounded",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/rounded/rounded.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "testxyu.ncp": {
            "id": 21,
            "status": "ready",
            "timestamp": "2023/05/03, 16:23:42",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 806,
                "dimy": 884,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "testxyu",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/testxyu/testxyu.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "woodver-engrave.ncp": {
            "id": 22,
            "status": "ready",
            "timestamp": "2023/05/03, 16:23:42",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 192,
                "dimy": 221,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "127-Logotip-01",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "woodver-engrave",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/woodver-engrave/woodver-engrave.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "NCP с петельками.ncp": {
            "id": 26,
            "status": "ready",
            "timestamp": "2023/05/10, 11:37:24",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 12,
                "formattype": "Sheet",
                "dimx": 245,
                "dimy": 341,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 7
              },
              "plan_attr": {
                "jobcode": "16.03 ???? 12?? S355J2",
                "count": 7
              }
            },
            "log": "",
            "cache_dir": "NCP с петельками",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/NCP с петельками/NCP с петельками.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "Импульс тест.ncp": {
            "id": 27,
            "status": "ready",
            "timestamp": "2023/05/12, 13:11:44",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 2,
                "formattype": "Sheet",
                "dimx": 75,
                "dimy": 70,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "Импульс тест",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/Импульс тест/Импульс тест.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "dragon2.ncp": {
            "id": 29,
            "status": "ready",
            "timestamp": "2023/05/12, 13:11:44",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 0.5,
                "formattype": "Sheet",
                "dimx": 509,
                "dimy": 404,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "dragon2",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/dragon2/dragon2.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "Микроперемычка тест.ncp": {
            "id": 30,
            "status": "ready",
            "timestamp": "2023/05/12, 13:11:44",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 2,
                "formattype": "Sheet",
                "dimx": 75,
                "dimy": 70,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "??????? ????",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "Микроперемычка тест",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/Микроперемычка тест/Микроперемычка тест.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "Просто отрез.ncp": {
            "id": 31,
            "status": "ready",
            "timestamp": "2023/05/15, 18:12:51",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 3,
                "formattype": "Sheet",
                "dimx": 2980,
                "dimy": 1500,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "Просто отрез",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/Просто отрез/Просто отрез.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "Фигурный отрез.ncp": {
            "id": 32,
            "status": "ready",
            "timestamp": "2023/05/15, 18:12:51",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 3,
                "formattype": "Sheet",
                "dimx": 2980,
                "dimy": 1500,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "Фигурный отрез",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/Фигурный отрез/Фигурный отрез.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "НЦП с вырезом посреди листа.ncp": {
            "id": 33,
            "status": "ready",
            "timestamp": "2023/05/15, 18:12:51",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 2,
                "formattype": "Sheet",
                "dimx": 2500,
                "dimy": 1250,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "НЦП с вырезом посреди листа",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/НЦП с вырезом посреди листа/НЦП с вырезом посреди листа.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "Слева.ncp": {
            "id": 34,
            "status": "ready",
            "timestamp": "2023/05/15, 18:12:51",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 2500,
                "dimy": 1250,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "Слева",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/Слева/Слева.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "Слева и справа.ncp": {
            "id": 35,
            "status": "ready",
            "timestamp": "2023/05/15, 18:12:51",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 2500,
                "dimy": 1250,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "Слева и справа",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/Слева и справа/Слева и справа.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "only отрез.ncp": {
            "id": 36,
            "status": "ready",
            "timestamp": "2023/05/15, 18:12:51",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 3,
                "formattype": "Sheet",
                "dimx": 2980,
                "dimy": 1500,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "only отрез",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/only отрез/only отрез.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "NCP skeleton cuts.ncp": {
            "id": 37,
            "status": "ready",
            "timestamp": "2023/05/16, 11:30:33",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 2,
                "formattype": "Sheet",
                "dimx": 2500,
                "dimy": 1250,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "NCP skeleton cuts",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/NCP skeleton cuts/NCP skeleton cuts.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "woodver-02.ncp": {
            "id": 38,
            "status": "ready",
            "timestamp": "2023/05/24, 16:41:33",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 192,
                "dimy": 221,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "127-Logotip",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "woodver-02",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/woodver-02/woodver-02.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "among_us.ncp": {
            "id": 40,
            "status": "ready",
            "timestamp": "2023/05/29, 12:21:53",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Stainless Steel",
                "materialcode": 1.4301,
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 78,
                "dimy": 96,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "among_us",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/among_us/among_us.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "брелки.ncp": {
            "id": 43,
            "status": "ready",
            "timestamp": "2023/07/06, 15:59:46",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1,
                "formattype": "Sheet",
                "dimx": 142.819044564909,
                "dimy": 95.3764611376238,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "brelki_323096id_2.0mm-1sht",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "брелки",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/брелки/брелки.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "Линейка-01.ncp": {
            "id": 44,
            "status": "ready",
            "timestamp": "2023/07/06, 15:59:46",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1,
                "formattype": "Sheet",
                "dimx": 600,
                "dimy": 600,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "???????",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "Линейка-01",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/Линейка-01/Линейка-01.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "test_circle.ncp": {
            "id": 45,
            "status": "ready",
            "timestamp": "2024/09/05, 10:33:25",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 992,
                "dimy": 921,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "circle_test",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "test_circle",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/test_circle/test_circle.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "Ellipses2.ncp": {
            "id": 48,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:40",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 5,
                "formattype": "Sheet",
                "dimx": 120,
                "dimy": 357,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "Ellipses2",
            "cls": "primary",
            "svg": "<h4>Готовится...</h4>",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "27.02 5мм-02.ncp": {
            "id": 49,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:40",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 5,
                "formattype": "Sheet",
                "dimx": 1301,
                "dimy": 1500,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "27.02 5??",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "27.02 5мм-02",
            "cls": "primary",
            "svg": "<h4>Готовится...</h4>",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "8339_geos_test__2.ncp": {
            "id": 50,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:40",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 3,
                "formattype": "Sheet",
                "dimx": 3000,
                "dimy": 1250,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 4
              },
              "plan_attr": {
                "jobcode": "29.12 3?? ????",
                "count": 4
              }
            },
            "log": "",
            "cache_dir": "8339_geos_test__2",
            "cls": "primary",
            "svg": "<h4>Готовится...</h4>",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "piercing_modes.ncp": {
            "id": 51,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 6,
                "formattype": "Sheet",
                "dimx": 123.012,
                "dimy": 121.012,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "???????",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "piercing_modes",
            "cls": "primary",
            "svg": "<h4>Готовится...</h4>",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "big_ellipsys_22.ncp": {
            "id": 52,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 10,
                "formattype": "Sheet",
                "dimx": 1000,
                "dimy": 3323,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "???????",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "big_ellipsys_22",
            "cls": "primary",
            "svg": "<h4>Готовится...</h4>",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "8339_geos_test.ncp": {
            "id": 53,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 3,
                "formattype": "Sheet",
                "dimx": 3000,
                "dimy": 1250,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 4
              },
              "plan_attr": {
                "jobcode": "29.12 3?? ????",
                "count": 4
              }
            },
            "log": "",
            "cache_dir": "8339_geos_test",
            "cls": "primary",
            "svg": "<h4>Готовится...</h4>",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "Ellipses.ncp": {
            "id": 54,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 5,
                "formattype": "Sheet",
                "dimx": 585,
                "dimy": 515,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "Ellipses",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/Ellipses/Ellipses.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "straight.ncp": {
            "id": 55,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1,
                "formattype": "Sheet",
                "dimx": 149.012,
                "dimy": 125.012,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "?????? ????",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "straight",
            "cls": "primary",
            "svg": "<h4>Готовится...</h4>",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "geos_test.ncp": {
            "id": 56,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 3,
                "formattype": "Sheet",
                "dimx": 2980,
                "dimy": 1500,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "geos_test",
            "cls": "primary",
            "svg": "<h4>Готовится...</h4>",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "diff_inlets.ncp": {
            "id": 57,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 5,
                "formattype": "Sheet",
                "dimx": 110.012,
                "dimy": 110.012,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "aa5-1111111111111111-21",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "diff_inlets",
            "cls": "primary",
            "svg": "<h4>Готовится...</h4>",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "700x700-10.0-test_888.ncp": {
            "id": 58,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 10,
                "formattype": "Sheet",
                "dimx": 700,
                "dimy": 700,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "Test",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "700x700-10.0-test_888",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/700x700-10.0-test_888/700x700-10.0-test_888.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "700x700-10.0-DD11-N0_222222.ncp": {
            "id": 59,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 10,
                "formattype": "Sheet",
                "dimx": 700,
                "dimy": 700,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "Test",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "700x700-10.0-DD11-N0_222222",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/700x700-10.0-DD11-N0_222222/700x700-10.0-DD11-N0_222222.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "700x700-10.0-DD11-N0_1111.ncp": {
            "id": 60,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 10,
                "formattype": "Sheet",
                "dimx": 700,
                "dimy": 700,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "Test",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "700x700-10.0-DD11-N0_1111",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/700x700-10.0-DD11-N0_1111/700x700-10.0-DD11-N0_1111.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "big_ellipsis.ncp": {
            "id": 61,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 10,
                "formattype": "Sheet",
                "dimx": 1026,
                "dimy": 3343,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "big_ellipsis",
            "cls": "primary",
            "svg": "<h4>Готовится...</h4>",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "davidtest.ncp": {
            "id": 62,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Rofl Steel",
                "materialcode": "RADNO",
                "thickness": 3.6,
                "formattype": "Sheet",
                "dimx": 630,
                "dimy": 306,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "Test Part Name_sheet",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "davidtest",
            "cls": "primary",
            "svg": "<h4>Готовится...</h4>",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "spread_test.ncp": {
            "id": 63,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 3,
                "formattype": "Sheet",
                "dimx": 3000,
                "dimy": 1250,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 4
              },
              "plan_attr": {
                "jobcode": "29.12 3?? ????",
                "count": 4
              }
            },
            "log": "",
            "cache_dir": "spread_test",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/spread_test/spread_test.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "Ellipses222.ncp": {
            "id": 64,
            "status": "ready",
            "timestamp": "2024/09/13, 13:35:41",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 5,
                "formattype": "Sheet",
                "dimx": 120,
                "dimy": 357,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "Ellipses222",
            "cls": "primary",
            "svg": "<h4>Готовится...</h4>",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          }
        }
      },
      "active": {
        "cls": "primary",
        "name": "На резку",
        "items": {
          "700x700-10.0-DD11-N0.ncp": {
            "id": 3,
            "status": "ready",
            "timestamp": "2022/12/14, 15:02:24",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 10,
                "formattype": "Sheet",
                "dimx": 700,
                "dimy": 700,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "Test",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "700x700-10.0-DD11-N0",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/700x700-10.0-DD11-N0/700x700-10.0-DD11-N0.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "xyu.ncp": {
            "id": 5,
            "status": "ready",
            "timestamp": "2022/12/14, 15:02:24",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 206,
                "dimy": 184,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "xyu",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/xyu/xyu.svg\" />",
            "success_count": 9,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "12301.ncp": {
            "id": 25,
            "status": "ready",
            "timestamp": "2023/05/04, 09:47:49",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild steel",
                "materialcode": "S235JR",
                "thickness": 2,
                "formattype": "Sheet",
                "dimx": 2500,
                "dimy": 1250,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "1683027664_1683027633_0_23348__S235JR_2.0mm_1_owner",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "12301",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/12301/12301.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          }
        }
      },
      "delayed": {
        "cls": "secondary",
        "name": "Отложенные",
        "items": {
          "3000x1500-10.0-DD11-N2.ncp": {
            "id": 1,
            "status": "ready",
            "timestamp": "2022/12/14, 15:02:24",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 10,
                "formattype": "Sheet",
                "dimx": 3000,
                "dimy": 1500,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "Test",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "3000x1500-10.0-DD11-N2",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/3000x1500-10.0-DD11-N2/3000x1500-10.0-DD11-N2.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "06.08 1,5мм-01.ncp": {
            "id": 2,
            "status": "ready",
            "timestamp": "2022/12/14, 15:02:24",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 2500,
                "dimy": 1250,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 8
              },
              "plan_attr": {
                "jobcode": "06.08 1.5??",
                "count": 8
              }
            },
            "log": "",
            "cache_dir": "06.08 1,5мм-01",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/06.08 1,5мм-01/06.08 1,5мм-01.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "3000x1500-10.0-DD11-N4.ncp": {
            "id": 6,
            "status": "ready",
            "timestamp": "2022/12/14, 15:02:24",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 10,
                "formattype": "Sheet",
                "dimx": 3000,
                "dimy": 1500,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "Test",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "3000x1500-10.0-DD11-N4",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/3000x1500-10.0-DD11-N4/3000x1500-10.0-DD11-N4.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "3000x1500-10.0-DD11-N3.ncp": {
            "id": 7,
            "status": "ready",
            "timestamp": "2022/12/14, 15:02:24",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DD11",
                "thickness": 10,
                "formattype": "Sheet",
                "dimx": 3000,
                "dimy": 1500,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "Test",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "3000x1500-10.0-DD11-N3",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/3000x1500-10.0-DD11-N3/3000x1500-10.0-DD11-N3.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "testwood.ncp": {
            "id": 23,
            "status": "ready",
            "timestamp": "2023/05/03, 16:23:42",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 992,
                "dimy": 921,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "127-Logotip",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "testwood",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/testwood/testwood.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "12303.ncp": {
            "id": 24,
            "status": "ready",
            "timestamp": "2023/05/04, 09:26:17",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild steel",
                "materialcode": "S235JR",
                "thickness": 2,
                "formattype": "Sheet",
                "dimx": 2500,
                "dimy": 1250,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "1683027664_1683027633_0_23348__S235JR_2.0mm_1_owner",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "12303",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/12303/12303.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "dragon.ncp": {
            "id": 28,
            "status": "ready",
            "timestamp": "2023/05/12, 13:11:44",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 0.5,
                "formattype": "Sheet",
                "dimx": 509,
                "dimy": 404,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "dragon",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/dragon/dragon.svg\" />",
            "success_count": 29,
            "state": false,
            "gcode": {
              "status": 1000,
              "line": 2512,
              "message": "Axis Disabled - GCode Aborted"
            }
          },
          "Among-Us-Spiderman-01.ncp": {
            "id": 39,
            "status": "ready",
            "timestamp": "2023/05/29, 12:21:53",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 77.0473240641818,
                "dimy": 95.0502562299207,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "Among-Us-Spiderman",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "Among-Us-Spiderman-01",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/Among-Us-Spiderman-01/Among-Us-Spiderman-01.svg\" />",
            "success_count": 5,
            "state": false,
            "gcode": {
              "status": 80,
              "line": 0,
              "message": "File ended with no percent sign"
            }
          },
          "заебал 26 кв 3.ncp": {
            "id": 41,
            "status": "ready",
            "timestamp": "2023/05/29, 16:55:59",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1,
                "formattype": "Sheet",
                "dimx": 799.012,
                "dimy": 195.012,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "????????",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "заебал 26 кв 3",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/заебал 26 кв 3/заебал 26 кв 3.svg\" />",
            "success_count": 0,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          }
        }
      },
      "done": {
        "cls": "success",
        "name": "Выполненные",
        "items": {
          "hookah - 2.ncp": {
            "id": 13,
            "status": "ready",
            "timestamp": "2022/12/15, 14:56:09",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Stainless Steel",
                "materialcode": 1.4301,
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 500,
                "dimy": 50,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "hookah - 2",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/hookah - 2/hookah - 2.svg\" />",
            "success_count": 2,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "xyu3.ncp": {
            "id": 14,
            "status": "ready",
            "timestamp": "2022/12/15, 17:38:37",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 206,
                "dimy": 184,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "xyu3",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/xyu3/xyu3.svg\" />",
            "success_count": 3,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "Hookah - 1.ncp": {
            "id": 16,
            "status": "ready",
            "timestamp": "2022/12/16, 11:14:12",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Stainless Steel",
                "materialcode": 1.4301,
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 500,
                "dimy": 50,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "Hookah - 1",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/Hookah - 1/Hookah - 1.svg\" />",
            "success_count": 1,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "schipci.ncp": {
            "id": 17,
            "status": "ready",
            "timestamp": "2022/12/23, 13:38:06",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 85,
                "dimy": 521,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "schipci",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/schipci/schipci.svg\" />",
            "success_count": 2,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "woodver-01.ncp": {
            "id": 20,
            "status": "ready",
            "timestamp": "2023/05/03, 16:23:42",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 192,
                "dimy": 221,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "127-Logotip",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "woodver-01",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/woodver-01/woodver-01.svg\" />",
            "success_count": 15,
            "state": {
              "current_contour": false,
              "sheet_position": false
            },
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          },
          "severnyiy_324307id_1.5mm-1sht-01.ncp": {
            "id": 42,
            "status": "ready",
            "timestamp": "2023/06/27, 17:26:20",
            "attributes": {
              "doc_attr": {
                "version": "1.0",
                "units": "Metric",
                "label": "Mild Steel",
                "materialcode": "DC01",
                "thickness": 1.5,
                "formattype": "Sheet",
                "dimx": 632.703717848,
                "dimy": 380.458973052,
                "cuttechnology": "Laser",
                "clamping": "False",
                "repeat": 1
              },
              "plan_attr": {
                "jobcode": "severnyiy_324307id_1.5mm-1sht",
                "count": 1
              }
            },
            "log": "",
            "cache_dir": "severnyiy_324307id_1.5mm-1sht-01",
            "cls": "primary",
            "svg": "<img style=\"max-height: 200px;width:100%;\" src=\"/cache/plan/severnyiy_324307id_1.5mm-1sht-01/severnyiy_324307id_1.5mm-1sht-01.svg\" />",
            "success_count": 7,
            "state": false,
            "gcode": {
              "status": 0,
              "line": 0,
              "message": ""
            }
          }
        }
      }
    },
    "hash": "3e52e4691fcfec6685002883ff73af89"
  }`)


  export default tasks
