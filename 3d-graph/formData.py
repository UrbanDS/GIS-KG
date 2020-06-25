import csv
import json
from functools import reduce

nodes = []
links = []
area = []

run_function = lambda x, y: x if y in x else x + [y]

# with open('../gisbok_lo.csv', errors='ignore') as f:
#     Reader = csv.DictReader(f)
#     for row in Reader:
#         area.append(row["area"])
#
# setArea = set(area)
# print(setArea)

l = ['Domain Applications', 'Data Management', 'Programming and Development', 'Cartography and Visualization', 'Foundational Concepts', 'Knowledge Economy', 'Analytics and Modeling', 'Data Capture', 'Computing Platforms', 'GIS&T and Society']


with open('../gisbok_lo.csv', errors='ignore') as f:
    Reader = csv.DictReader(f)
    for row in Reader:
        group = l.index(row["area"]) + 1
        node1 = {"id": row["area"], "group": group}
        nodes.append(node1)
        node2 = {"id": row["theme"], "group": group}
        nodes.append(node2)
        node3 = {"id": row["topic"], "group": group}
        nodes.append(node3)
        node4 = {"id": row["learning_objective"], "group": group}
        nodes.append(node4)
        link1 = {"source": row["area"], "target": row["theme"],  "value": 10}
        links.append(link1)
        link2 = {"source": row["theme"], "target": row["topic"], "value": 10}
        links.append(link2)
        link3 = {"source": row["topic"], "target": row["learning_objective"], "value": 10}
        links.append(link3)


print(nodes)

true_nodes = reduce(run_function, [[], ] + nodes)
# print(true_nodes)

true_link = reduce(run_function, [[], ] + links)
print(true_link)

data = {"nodes": true_nodes, "links": true_link}
filename = 'force_graph.json'
filename2 = 'links.json'
with open(filename, 'w+') as file_obj:
    json.dump(data, file_obj)

with open(filename2, 'w+') as file_obj:
    json.dump(true_link, file_obj)


