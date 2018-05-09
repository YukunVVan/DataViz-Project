from flask import Flask, Response, render_template, request, url_for, flash, jsonify
# import altair as alt
import pandas as pd
import altair as alt
import json
import psycopg2
# from flask import Flask, request, session, g, redirect, url_for, abort, \
#      render_template, flash
app = Flask(__name__)

def getData(by,filter):
    host = "datavis.cauuh8vzeelb.us-east-1.rds.amazonaws.com"
    database = "top5"
    user = "teamwonder"
    password = "visproject"

    qfilter = []
    for f in filter:
        if filter[f] == 'all':
            continue
        if f == "fromyear":
            qfilter.append("date > "+str(filter[f]))
            continue
        if f == "toyear":
            qfilter.append("date < "+str(filter[f]))
            continue
        if f == "incident_z" and filter[f] == "gen1":
            qfilter.append("(incident_z = '10001' OR incident_z = '10002' OR incident_z = '11201')")
            continue
        qfilter.append(str(f)+' = '+str(filter[f]))

    if qfilter:
        querytext = ("SELECT " + by + ", COUNT(gid) FROM tabletop5 " +
                     "WHERE " + " AND ".join(qfilter) + " GROUP BY "+
                     by + " ORDER BY " + by + ";")
    else:
        querytext = ("SELECT " + by + ", COUNT(gid) FROM tabletop5 " +
                     " GROUP BY "+ by + " ORDER BY " + by + ";")
    print(querytext)

    con = psycopg2.connect(host=host, database=database, user=user, password=password)
    cur = con.cursor()
    cur.execute(querytext)
    rows = cur.fetchall()
    return rows


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/normal/<seq>/<zipcode>/<category>/<fromyear>/<toyear>',methods=['GET', 'POST'])
def normal(seq,zipcode,category,fromyear,toyear):
    # f = request.get_json(force=True)
    # print(f)
    filter = {"incident_z":zipcode,"complaint_":category,"fromyear":fromyear,"toyear":toyear}
    if seq == '1':
        df = getData("incident_z",filter)
        # print(df)
        return jsonify(df)
    if seq == '2':
        df = getData("complaint_, SUBSTRING(date, 1, 7)",filter)
        # print(df)
        line = ''
        if df is not None:
            # data = "https://raw.githubusercontent.com/lingyielia/TextDataAnalysis/master/casebytwo.csv"
            data = pd.DataFrame(df,columns=['type','date','count'])

            highlight = alt.selection(type='single', on='mouseover',
                          fields=['type'], nearest=True)

            base = alt.Chart(data).encode(
                x='date:T',
                y='count:Q',
                color='type:N'
            )

            points = base.mark_circle().encode(
                opacity=alt.value(0)
            ).properties(
                selection=highlight,
                width=400
            )

            lines = base.mark_line().encode(
                size=alt.condition(~highlight, alt.value(1), alt.value(3))
            )

        return Response((points+lines).to_json(),
            mimetype='application/json',
            headers={
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            }
        )
    if seq == '3':
        df = getData("complaint_",filter)
        # print(df)
        return jsonify(df)
    #
    # if seq == '4':
    #     #



# def line(zipcode,category,fromyear,toyear):

if __name__ == '__main__':
   app.run(debug = True)
