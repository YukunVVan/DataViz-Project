from flask import Flask, Response, render_template, request, url_for, flash, jsonify
from setting import host, database, user, password, Gentrifying, Non_Gentrifying, Higher_Income, cur
# import altair as alt
import pandas as pd
import altair as alt
import json
# from flask import Flask, request, session, g, redirect, url_for, abort, \
#      render_template, flash
app = Flask(__name__)

def getData(by,filter):

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
        if f == "incident_z" and filter[f] == "gen_ge":
            str_ge = "("
            for i in Gentrifying:
                str_ge = str_ge + "incident_z = '" + str(i) + "' OR "
            str_ge = str_ge[:-4] + ")"
            #print(str_ge)
            qfilter.append(str_ge)
            continue
        if f == "incident_z" and filter[f] == "gen_ng":
            str_ng = "("
            for i in Non_Gentrifying:
                str_ng = str_ng + "incident_z = '" + str(i) + "' OR "
            str_ng = str_ng[:-4] + ")"
            #print(str_ng)
            qfilter.append(str_ng)
            continue
        if f == "incident_z" and filter[f] == "gen_hi":
            str_hi = "("
            for i in Higher_Income:
                str_hi = str_hi + "incident_z = '" + str(i) + "' OR "
            str_hi = str_hi[:-4] + ")"
            #print(str_hi)
            qfilter.append(str_hi)
            continue
        if f == "geo":
            qfilter.append(filter[f])
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

    cur.execute(querytext)
    rows = cur.fetchall()
    return rows

@app.route('/')
def index():
    return render_template('index.html')

def c3data(df):
    data = pd.DataFrame(df,columns=['type','date','count'])

    dftemp = pd.DataFrame(columns=['date'])
    for name in data['type'].unique():
        dfonetype = data[data['type']==str(name)][['date','count']]
        dfonetype.columns = ['date', str(name)]
        dftemp = dftemp.merge(dfonetype, on='date', how='outer')

    jsonstyle = {}
    jsonstyle['date'] = ['x'] + df['date'].tolist()
    for i in range(1,len(df.columns)):
        jsonstyle[df.columns[i]] = [df.columns[i]] + df[df.columns[i]].tolist()

    return json.dumps(jsonstyle)

# def vega(df):
#     data = pd.DataFrame(df,columns=['type','date','count'])
#
#     highlight = alt.selection(type='single', on='mouseover',
#                   fields=['type'], nearest=True)
#
#     base = alt.Chart(data).encode(
#         x='date:T',
#         y='count:Q',
#         color='type:N'
#     )
#
#     points = base.mark_circle().encode(
#         opacity=alt.value(0)
#     ).properties(
#         selection=highlight,
#         width=400
#     )
#
#     lines = base.mark_line().encode(
#         size=alt.condition(~highlight, alt.value(1), alt.value(3))
#     )
#
#     return (points+lines).to_json()


@app.route('/normal/<seq>/<zipcode>/<category>/<fromyear>/<toyear>',methods=['GET', 'POST'])
def normal(seq,zipcode,category,fromyear,toyear):
    # f = request.get_json(force=True)
    # print(f)
    filter = {"incident_z":zipcode,"complaint_":category,"fromyear":fromyear,"toyear":toyear}
    if seq == '1':
        if zipcode not in set(['gen_ge','gen_ng','gen_hi']):
            filter["incident_z"] = "all"
        df = getData("incident_z",filter)
        # print(df)
        return jsonify(df)
    if seq == '2':
        df = getData("complaint_, SUBSTRING(date, 1, 7)",filter)
        print(df[:5])
        # print(df)
        line = ''
        if df is not None:
            # data = "https://raw.githubusercontent.com/lingyielia/TextDataAnalysis/master/casebytwo.csv"
            line = c3data(df)

        return Response(line,
            mimetype='application/json',
            headers={
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            }
        )
    # if seq == '3':
    #     df = getData("complaint_",filter)
    #     # print(df)
    #     return jsonify(df)
    #
    # if seq == '4':
    #     #

@app.route('/circle/<radius>/<lat>/<lng>/<category>/<fromyear>/<toyear>',methods=['GET', 'POST'])
def circle(radius,lat,lng,category,fromyear,toyear):
    geo = "ST_DWithin(the_geom::geography, ST_SetSRID(ST_Point(" + lng + ", " + lat + "),4326)::geography, " + radius + ")"
    filter = {"geo":geo,"complaint_":category,"fromyear":fromyear,"toyear":toyear}
    df = getData("complaint_, SUBSTRING(date, 1, 7)",filter)
    print(df[:5])
    line = ''
    if df is not None:
        line = c3data(df)

    return Response(line,
        mimetype='application/json',
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        }
    )
# def line(zipcode,category,fromyear,toyear):

if __name__ == '__main__':
   app.run(debug = True)
