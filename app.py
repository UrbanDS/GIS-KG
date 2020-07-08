from typing import List, Dict
# import mysql.connector
# import simplejson as json
import json
from flask import Flask, Response, request
import pandas as pd
import numpy as np
from transformers import AutoTokenizer,AutoModel
import torch
import pickle
from flask_cors import CORS

app = Flask(__name__)

with torch.no_grad():
    tokenizer = AutoTokenizer.from_pretrained('./bert_large/')
    model = AutoModel.from_pretrained('./bert_large/')
    model.eval()
    with open('metadata.pkl', 'rb') as fr:
        metadata = pickle.load(fr)
    ebk = pd.read_pickle('id_title_abstract_embedding.pickle')
    scibert_embedding_graph = np.squeeze(np.load('gisbok_bert_embedding.npy'))
    df_papers = pd.read_pickle("nodes_papers.pickle").set_index('topic')
    with open('id_url_dict.pickle', 'rb') as f_url:
        id_url_dict=pickle.load(f_url)

#
# def cities_import() -> List[Dict]:
#     config = {
#         'user': 'root',
#         'password': 'root',
#         'host': 'db',
#         'port': '3306',
#         'database': 'citiesData'
#     }
#     connection = mysql.connector.connect(**config)
#     cursor = connection.cursor(dictionary=True)
#
#     cursor.execute('SELECT * FROM tblCitiesImport')
#     result = cursor.fetchall()
#
#     cursor.close()
#     connection.close()
#
#     return result
#
#
# @app.route('/')
# def index() -> str:
#     js = json.dumps(cities_import())
#     resp = Response(js, status=200, mimetype='application/json')
#     return resp


def sb_papers(i, tokenizer, model):
    with torch.no_grad():
        rawtext = i
        indexed_tokens = torch.tensor(
            tokenizer.encode(rawtext, add_special_tokens=True, max_length=512)).unsqueeze(
            0)  # Batch size 1
        outputs = model(indexed_tokens)
        embedding = outputs[0][:, 0, :]
        return embedding.cpu().detach().numpy()


def cos(w1,w2):
    up = np.dot(w1,w2)
    if up <= 0:
        return 0
    down = (np.linalg.norm(w1) * np.linalg.norm(w2))
    if down==0:
        return 0
    return up/down


def matrix_similarity(w1,w2):
    results = []
    for i in w1:
        for ii in w2:
            results.append(cos(i,ii))
    return np.array(results).reshape(w1.shape[0],w2.shape[0])


app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.route('/search', methods=['GET'])
def search():
    with torch.no_grad():
        q=request.args.get("query")
        with open("query.log", "a") as fd:
            fd.write(q+'\n')
        scibert_embedding_q = sb_papers(q, tokenizer, model)
        similar_matrix = matrix_similarity(scibert_embedding_q, scibert_embedding_graph)
        sort_sm = similar_matrix.argsort(axis=-1)
        for ii in range(0, 10):
            treenode = metadata[sort_sm[0][-1 - ii]]
            paper_id_list = df_papers.loc[metadata[sort_sm[0][-1 - ii]].lower()]['PaperIdList0']
            if not isinstance(paper_id_list, list):
                paper_id_list = paper_id_list[0]
            papers_info = ebk.loc[paper_id_list]
            embedded_ebk = np.squeeze(np.array(papers_info['scibert_embedding'].to_list()))
            similarity_score_matrix = []
            for iii in embedded_ebk:
                similarity_score_matrix.append(cos(scibert_embedding_q[0], iii))
            index_sort = np.array(similarity_score_matrix).argsort()
            index_sort = np.squeeze(index_sort)
            results = []
            for iii in range(0, 100):
                try:
                    url = id_url_dict[papers_info.index[index_sort[-1 - iii]]]
                except KeyError:
                    url = ''
                results.append({"PaperId":str(papers_info.index[index_sort[-1 - iii]]),
                                "PaperTitle":papers_info['PaperTitle'].iloc[index_sort[-1 - iii]],
                                "Abstract": papers_info['abstract'].iloc[index_sort[-1 - iii]],
                                'url': url
                                })
            result_obj = {'treenode':treenode, 'paper_list':results}
            js = json.dumps(result_obj)
            resp = Response(js, status=200, mimetype='application/json')
            return resp


if __name__ == '__main__':
    app.run(host='0.0.0.0')
