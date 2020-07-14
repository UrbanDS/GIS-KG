const search = document.querySelector("#query");
const result = document.querySelector("#result");
const query = async () => {
  result.innerHTML = "";
  const input_value = search.value;
  const str = input_value.toLowerCase();
  try {
    const response = await fetch("./gisbok.json");
    if (response.ok) {
      let list = await response.json();
      console.log(list);
      if (!(list instanceof Array)) {
        return;
      }

      const arr = [];
      list.map((a_data) => {
        const topic = a_data.topic.toLowerCase();
        const theme = a_data.theme.toLowerCase();
        const area = a_data.area.toLowerCase();
        const object = a_data.learning_objective.toLowerCase();
        if (
          topic.indexOf(str) >= 0 ||
          theme.indexOf(str) >= 0 ||
          area.indexOf(str) >= 0 ||
          object.indexOf(str) >= 0
        ) {
          arr.push(a_data);
        }
      });

      console.log(arr);
      arr.map((a_data) => {
        const container = document.createElement("div");
        const theme = document.createElement("h4");
        const topic = document.createElement("div");
        const area = document.createElement("div");
        const object = document.createElement("div");
        topic.innerText = a_data.topic;
        theme.innerText = a_data.theme;
        area.innerText = a_data.area;
        object.innerText = a_data.learning_objective;
        container.appendChild(theme);
        container.appendChild(topic);
        container.appendChild(area);
        container.appendChild(object);
        result.appendChild(container);
      });
    }
  } catch (error) {
    console.log(error);
  }
};
window.onload = query();
