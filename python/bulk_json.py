import json

from elasticsearch import Elasticsearch, helpers

es = Elasticsearch(
    ['localhost'],
    port=9200

)

def genBulk(docs):

    for doc in docs:
        yield {"_index": "testicu", "_id": doc['id'], '_source': doc}
        #yield {"_index": "thailand", 'pipeline': 'pipeline1', '_source': doc}


if __name__ == "__main__":
    filename = 'pantip.sinthorn.json'
    
    #with open(filename) as f:
        #data = json.load(f)
        
    data = []
    
    f = open(filename, 'r')

    while True:
        s = f.readline()
        
        if s == '': # check file end
            break
        else:
            jsonObj = json.loads(s)
            data.append(jsonObj)
            
    f.close()
    
    #with open(filename) as f:
        #data = json.load(obj)
    size=100000        
    bulk_batch = []
    for n,line in enumerate(data):
        
        try:
            bulk_batch.append({
                "id": n,
                "topic_id": int(line['topic_id']),
                "title": line['title'],
                "message": line['message'],
                "topic_type": int(line['topic_type']),
                "created_time": line['created_time'],
                "views_count": int(line['views_count']),
                "comments_count": int(line['comments_count']),
                "votes_count": int(line['votes_count']),
                "author": line['author'],
                "tags": line['tags']
            })
        except:
            print(n)
        if (n + 1) % size == 0:
            print('Batch:', n + 1)
            try:
                helpers.bulk(es, genBulk(bulk_batch), request_timeout=300)
                bulk_batch = []
            except Exception as e:
                print(str(e))
    print('End:', n + 1)
    helpers.bulk(es, genBulk(bulk_batch))
    print('Total', len(data))