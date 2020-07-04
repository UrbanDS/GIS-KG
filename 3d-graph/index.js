const search = document.querySelector("#query");
const result = document.querySelector(".result");

const colors = [
  "#aec7e8",
  "#ffbb78",
  "#98df8a",
  "#ff9896",
  "#c5b0d5",
  "#c49c94",
  "#f7b6d2",
  "#c7c7c7",
  "#dbdb8d",
  "#9edae5",
];

const aname = ["DA", "DM", "PD", "CV", "FC", "KE", "AM", "DC", "CP", "GS"];
const fname = [
  "Domain Applications",
  "Data Management",
  "Programming and Development",
  "Cartography and Visualization",
  "Foundational Concepts",
  "Knowledge Economy",
  "Analytics and Modeling",
  "Data Capture",
  "Computing Platforms",
  "GIS&T and Society",
];

// const displayGraph = () => {
//   const Graph = ForceGraph3D()(document.getElementById("3d-graph"));
//   axios.get("./force_graph.json").then((res) => {
//     const data = res.data;
//     Graph.nodeLabel("id")
//       .nodeAutoColorBy("group")
//       .forceEngine("ngraph")
//       .graphData(data)
//       .nodeRelSize(6)
//       .onNodeClick((node) => {
//         search.value = node.id;
//         query();
//       });
//   });
// };

const displayGraph = (data) => {
  const Graph = ForceGraph3D()(document.getElementById("3d-graph"));
  Graph
    // .nodeLabel("id")
    // .nodeAutoColorBy("group")
    // .nodeColor((node) => {
    //   return colors[node.group - 1];
    // })
    .nodeThreeObject(nodeRender(0))
    // .forceEngine("ngraph")
    .graphData(data)
    // .nodeRelSize(6)
    .onNodeClick((node) => {
      const text = node.name.toString();
      search.value = text;
      query();
    });
};

const query = async () => {
  result.innerHTML = "";
  const keyWord = search.value;
  const base = "http://0.0.0.0:5000/search?query=";
  const str = keyWord.toLowerCase();
  try {
    const url = base + str;
    const response = await fetch(url);
    if (response.ok) {
      let list = await response.json();
      const treeNode = list.treenode;
      adjust_data(treeNode);
      const paperList = list.paper_list;
      const themeCon = document.createElement("h3");
      themeCon.innerText = "Tree Node: " + treeNode;
      result.appendChild(themeCon);
      paperList.map((a_data) => {
        const title = a_data.PaperTitle;
        const abstract = a_data.Abstract;
        const link = a_data.url;
        const container = document.createElement("div");
        const titleCon = document.createElement("a");
        const abstractCon = document.createElement("p");
        titleCon.innerText = title.toUpperCase();
        titleCon.setAttribute("href", link);
        titleCon.setAttribute("target", "_blank");
        abstractCon.innerText = abstract;
        container.appendChild(titleCon);
        container.appendChild(abstractCon);
        result.appendChild(container);
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadgraph = () => {
  // 返回一个promise对象
  return new Promise((resolve, reject) => {
    axios
      // .get("./graph_lsa_all.json")
      .get("./adjustedForcedGraph.json")
      .then((res) => {
        resolve(res.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};
const categoryDataDisplay = () => {
  loadgraph().then(
    (res) => {
      const filterNode = [];
      const filterLink = [];
      const info = $("#selectVal").val();
      // console.log(info);
      if (info == "ALL") {
        location.reload();
        return;
      }
      res.nodes.map((a_node) => {
        const searchNode = a_node.name.substr(0, 2);
        if (searchNode.indexOf(info) >= 0) {
          filterNode.push(a_node);
        }
      });

      // console.log(filterNode);
      filterNode.map((fliNode) => {
        res.links.map((a_link) => {
          if (fliNode.id == a_link.source) {
            filterNode.map((match_node) => {
              if (a_link.target == match_node.id) {
                filterLink.push(a_link);
              }
            });
          }
        });
      });

      const filterData = { nodes: filterNode, links: filterLink };
      displayGraph(filterData);
    },
    (error) => {
      console.log(error);
    }
  );
};
const adjust_data = (info) => {
  loadgraph().then(
    (res) => {
      const filterNode = new Set();
      // const filterNode = [];
      const filterLink = [];
      // const groups = new Set();
      const str = info.toLowerCase();

      res.nodes.map((a_node) => {
        const searchNode = a_node.name.toLowerCase();
        if (searchNode.indexOf(str) >= 0) {
          filterNode.add(a_node);
          // filterNode.push(a_node);
        }
      });
      // console.log(groups);
      // groups.forEach((a_group) => {
      //   res.nodes.map((a_node) => {
      //     if (a_node.group == a_group) {
      //       filterNode.push(a_node);
      //     }
      //   });
      // });
      // console.log(filterNode);
      filterNode.forEach((fliNode) => {
        res.links.map((a_link) => {
          if (fliNode.id == a_link.source || a_link.target == fliNode.id) {
            filterLink.push(a_link);
          }
        });
      });
      // console.log(filterLink);
      filterLink.map((a_link) => {
        res.nodes.map((a_node) => {
          if (a_node.id == a_link.target || a_node.id == a_link.source) {
            filterNode.add(a_node);
          }
        });
      });

      const finFilterNodes = Array.from(filterNode);
      // console.log(finFilterNodes);

      // const str = info.toLowerCase();
      // res.links.map((a_link) => {
      //   const searchSource = a_link.source.toLowerCase();
      //   const searchTarget = a_link.target.toLowerCase();

      //   if (searchSource.indexOf(str) >= 0 || searchTarget.indexOf(str) >= 0) {
      //     filterLink.push(a_link);
      //   }
      //   // if (searchSource.indexOf(str) >= 0) {
      //   //   filterLink.push(a_link);
      //   // }
      // });

      // res.nodes.map((a_node) => {
      //   const searchTerm = a_node.id.toLowerCase();
      //   filterLink.map((a_link) => {
      //     const filterSource = a_link.source.toLowerCase();
      //     const filterTarget = a_link.target.toLowerCase();
      //     if (
      //       searchTerm.indexOf(filterSource) >= 0 ||
      //       searchTerm.indexOf(filterTarget) >= 0
      //     ) {
      //       filterNode.push(a_node);
      //     }
      //   });
      // });

      // console.log(filterNode);
      // console.log(filterLink);
      const filterData = { nodes: finFilterNodes, links: filterLink };
      // console.log(filterData);
      displayGraph(filterData);
    },
    (error) => {
      console.log(error);
    }
  );
};

String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substr(0, index) +
    replacement +
    this.substr(index + replacement.length)
  );
};

const autoBreak = function (str, nc) {
  str += " ";
  var indices = [];
  for (var i = 0; i < str.length; i++) {
    if (str[i] === " ") indices.push(i);
  }
  var lines = 1;
  var th = nc;
  for (var i = 0; i < indices.length; i++) {
    if (indices[i] > th) {
      var _i = i == 0 ? i : i - 1;
      str = str.replaceAt(indices[_i], "\n");
      th = nc + indices[_i];
      lines++;
    }
  }
  return { str: str, lines: lines };
};

const nodeRender = function (hasText) {
  var ret = function (n) {
    // console.log(n);
    var group = new THREE.Group();
    var pointgeo = new THREE.BufferGeometry();
    pointgeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0, 0, 0], 3)
    );
    var material = new THREE.RawShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(colors[aname.indexOf(n.name.substr(0, 2))]),
        },
        size: { value: hasText < 0 ? n.val * 0.1 : n.val * 2.5 },
      },
      vertexShader: document.getElementById("vertex-shader").textContent,
      fragmentShader: document.getElementById("fragment-shader").textContent,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    var sphgeo = new THREE.SphereGeometry(n.val * 1.6, 32, 32);
    var sphmtl = new THREE.MeshBasicMaterial({
      opacity: 0.3,
      transparent: true,
    });

    group.add(new THREE.Points(pointgeo, material));
    group.add(new THREE.Mesh(sphgeo, sphmtl));

    var bt = autoBreak(n.name.split(" | ")[0], 20);
    if (hasText) {
      const sprite = new SpriteText(
        hasText < 0
          ? n.fullname
            ? " " + n.fullname + `(${n.name})`
            : n.name
          : //'       ' + n.name.split(' | ')[0]
          n.score
          ? bt.str + `\n(${n.score.toPrecision(2)})`
          : bt.str
      );
      //   console.log(n);
      sprite.material.depthTest = false;
      sprite.material.depthWrite = false;
      sprite.color = "#ccc";
      sprite.textHeight = hasText < 0 ? 18 : 3;
      sprite.fontSize = 30;
      sprite.fontFace = "serif";
      sprite.center =
        hasText < 0
          ? { x: 0, y: 0.53 }
          : { x: 0.5, y: 1 + 1.5 / (n.score ? bt.lines + 1 : bt.lines) };
      group.add(sprite);
    }
    return group;
  };
  return ret;
};

const createStaticScene = function (div_name, callback) {
  var div = $(div_name)[0];
  var width = div.clientWidth;
  var height = div.clientHeight;
  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    1,
    1000
  );
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  div.appendChild(renderer.domElement);
  callback(scene, camera);
  renderer.render(scene, camera);
};

$(() => {
  loadgraph().then(
    (res) => {
      displayGraph(res);
    },
    (error) => {
      console.log(error);
    }
  );
  createStaticScene("#legend-c", (scene, camera) => {
    camera.position.set(130, 0, 80);
    for (var i in colors) {
      var obj = nodeRender(-1)({
        name: aname[i],
        fullname: fname[i],
        val: 2,
      });
      obj.translateY(130 - i * 28.889);
      scene.add(obj);
    }
  });
});
