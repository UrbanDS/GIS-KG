const search = document.querySelector("#query");
const result = document.querySelector(".result");

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
  Graph.nodeLabel("id")
    .nodeAutoColorBy("group")
    .forceEngine("ngraph")
    .graphData(data)
    .nodeRelSize(6)
    .onNodeClick((node) => {
      search.value = node.id;
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
      .get("./force_graph.json")
      .then((res) => {
        resolve(res.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

const adjust_data = (info) => {
  loadgraph().then(
    (res) => {
      const filterNode = [];
      const filterLink = [];

      const str = info.toLowerCase();
      res.nodes.map((a_node) => {
        const searchTerm = a_node.id.toLowerCase();
        if (searchTerm.indexOf(str) >= 0) {
          filterNode.push(a_node);
        }
      });
      res.links.map((a_link) => {
        const searchSource = a_link.source.toLowerCase();
        const searchTarget = a_link.target.toLowerCase();
        if (searchSource.indexOf(str) >= 0 || searchTarget.indexOf(str) >= 0) {
          filterLink.push(a_link);
        }
      });
      // console.log(filterNode);
      // console.log(filterLink);
      const filterData = { nodes: filterNode, links: filterLink };
      // console.log(filterData);
      displayGraph(filterData);
    },
    (error) => {
      console.log(error);
    }
  );
};

window.onload = function () {
  loadgraph().then(
    (res) => {
      displayGraph(res);
    },
    (error) => {
      console.log(error);
    }
  );
};
