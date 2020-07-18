const search = document.querySelector("#query");
const result = document.querySelector(".result");

// const hl = document.getElementById("sort");
// hl.onclick = function () {
//   judge = !judge;
//   if (judge == true) {
//     hl.value = "Recent to Past";
//   } else {
//     hl.value = "Past to Recent";
//   }
// };

let PaperData = [];
let treeNode = "";
const sub = document.querySelector(".refreshPaper");
sub.onclick = function () {
  refreshPaperList(PaperData);
};

const enterSearch = () => {
  var event = window.event || arguments.callee.caller.arguments[0];
  if (event.keyCode == 13) {
    query();
  }
};

// const colors = [
//   "#aec7e8",
//   "#ffbb78",
//   "#98df8a",
//   "#ff9896",
//   "#c5b0d5",
//   "#c49c94",
//   "#f7b6d2",
//   "#c7c7c7",
//   "#dbdb8d",
//   "#9edae5",
// ];

const colors = [
  "#935529",
  "#88b04b",
  "#009b77",
  "#dd4124",
  "#d65076",
  "#efc050",
  "#5b5ea6",
  "#9b2335",
  "#dfcfbe",
  "#fa9a85",
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
  Graph.refresh();
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
      search.value = text.substring(5);
      query();
    });
};

function quickSorting(input, l, r) {
  if (l < r) {
    var pivot = partition(input, l, r);
    quickSorting(input, l, pivot - 1);
    quickSorting(input, pivot + 1, r);
  }
}

function partition(input, l, r) {
  var i = l - 1;
  var j = l;
  for (; j <= r; j++) {
    if (
      new Date(input[j].publishTime).valueOf() >=
      new Date(input[r].publishTime).valueOf()
    ) {
      i++;
      var temp = input[i];
      input[i] = input[j];
      input[j] = temp;
    }
  }
  return i;
}

const reverseArr = (input) => {
  const left = input.length - 1;
  for (i = 0, j = left; i <= left; i++, j--) {
    if (i < j) {
      let temp = input[i];
      input[i] = input[j];
      input[j] = temp;
    }
  }
};

const displayResult = (input) => {
  result.innerHTML = "";
  const themeCon = document.createElement("h3");
  themeCon.innerText = "Tree Node: " + treeNode;
  result.appendChild(themeCon);
  const total = input.length;
  const totalCon = document.createElement("h3");
  totalCon.innerText = "Results: " + total;
  result.appendChild(totalCon);
  input.map((a_data) => {
    const title = a_data.PaperTitle;
    const abstract = a_data.Abstract;
    const link = a_data.url;
    // const author = "Author: " + a_data.author;
    const author =
      a_data.author == "" ? "Author: Not found " : "Author: " + a_data.author;

    const publish = "Publish Time: " + a_data.publishTime;
    const container = document.createElement("div");
    const titleCon = document.createElement("a");
    const abstractCon = document.createElement("p");
    const header = document.createElement("header");
    const info = document.createElement("p");
    const authorCon = document.createElement("section");
    const publishCon = document.createElement("section");
    titleCon.innerText = title.toUpperCase();
    titleCon.setAttribute("href", link);
    titleCon.setAttribute("target", "_blank");
    authorCon.innerText = author;
    publishCon.innerText = publish;
    abstractCon.innerText = abstract;
    header.appendChild(titleCon);

    info.appendChild(authorCon);
    info.appendChild(publishCon);
    header.appendChild(info);
    result.appendChild(header);
    container.appendChild(header);
    container.appendChild(abstractCon);
    result.appendChild(container);
  });
};

const yearFilter = (input) => {
  const years = readIntervel();
  const filterData = [];
  input.map((a_data) => {
    const year = parseInt(a_data.publishTime.substring(0, 4));
    if (years.indexOf(year) != -1) {
      filterData.push(a_data);
    }
  });
  return filterData;
};

const sortProcess = (input) => {
  const sortSit = document.getElementById("sort");
  if (sortSit.value == "-") {
    return input;
  }
  const right = input.length - 1;
  const startNum = 0;
  quickSorting(input, startNum, right);
  if (sortSit.value == "new") {
  } else {
    reverseArr(input);
  }
  return input;
};

const refreshPaperList = (input) => {
  if (input.length == 0) {
    return;
  }
  const yearFilterData = yearFilter(input);
  const sortData = sortProcess(yearFilterData);
  displayResult(sortData);
};

const query = async () => {
  const keyWord = search.value;
  const base = "http://0.0.0.0:5000/search?query=";
  const str = keyWord.toLowerCase();
  try {
    const url = base + str;
    const response = await fetch(url);
    if (response.ok) {
      let list = await response.json();
      treeNode = list.treenode;
      adjust_data(treeNode);
      PaperData = list.paper_list;
      document.getElementById("time1").value = "";
      document.getElementById("time2").value = "";
      document.getElementById("sort").value = "-";
      displayResult(PaperData);
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
      .get("./ForcedGraph2.json")
      // .get("./adjustedForcedGraph.json")
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
        size: { value: hasText < 0 ? n.val * 0.1 : n.val * 3 },
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

const getInterval = () => {
  var time1 = document.getElementById("time1").value;
  var time2 = document.getElementById("time2").value;
  var lowNum;
  var highNum;
  if (time1 == "" && time2 == "") {
    return [1950, 2025];
  } else if (time1 == "" && time2 != "") {
    highNum = parseInt(time2);
    return [1950, highNum];
  } else if (time1 != "" && time2 == "") {
    lowNum = parseInt(time1);
    return [lowNum, 2025];
  } else {
    lowNum = parseInt(time1);
    highNum = parseInt(time2);
    return [lowNum, highNum];
  }
};

const readIntervel = () => {
  var list = [];
  var stringIntervel = getInterval();
  var lowNum = stringIntervel[0];
  var highNum = stringIntervel[1];

  if (highNum - lowNum >= 0) {
    for (var i = lowNum; i <= highNum; i++) {
      list.push(i);
    }
  } else {
    for (var i = highNum; i <= lowNum; i++) {
      list.push(i);
    }
  }

  return list;
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
