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

    Gentrifying = [10002,10003,10009,10026,10027,10029,10030,10031,10032,10033,10034,10035,10037,10039,10040,10454,10455,10456,10457,10458,10459,10460,10474,11102,11103,11105,11106,11206,11211,11212,11213,11216,11220,11221,11222,11225,11232,11233,11237,11249,11370]
    Non_Gentrifying = [10451,10452,10453,10463,10468,10472,10473,11204,11208,11214,11223,11224,11239]
    Higher_Income = [11414,11415,11416,11417,11418,11419,11420,11421,11422,11423,11426,11427,11428,11429,11430,11432,11433,11434,11435,11436,11530,11691,11692,11693,11694,11695,11697]


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
            print(str_ge)
            qfilter.append(str_ge)
            continue
        if f == "incident_z" and filter[f] == "gen_ng":
            str_ng = "("
            for i in Non_Gentrifying:
                str_ng = str_ng + "incident_z = '" + str(i) + "' OR "
            str_ng = str_ng[:-4] + ")"
            print(str_ng)
            qfilter.append(str_ng)
            continue
        if f == "incident_z" and filter[f] == "gen_hi":
            str_hi = "("
            for i in Higher_Income:
                str_hi = str_hi + "incident_z = '" + str(i) + "' OR "
            str_hi = str_hi[:-4] + ")"
            print(str_hi)
            qfilter.append(str_hi)
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
        if zipcode != 'gen1':
            filter["incident_z"] = "all"
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
