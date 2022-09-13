import streamlit as st
import pandas as pd
import numpy as np
import base64
import math

pp_img = 'img/pic1.jpeg'

project_list = "projects_list.xlsx"


# Converting links to html tags
def path_to_image_html(path):
    return '<img src="' + path + '" width="60" >'

@st.cache
def convert_df(input_df):
     # IMPORTANT: Cache the conversion to prevent computation on every rerun
     return input_df.to_html(escape=False, formatters=dict(img=path_to_image_html))


def card(project_title,start_date,end_date,tech,Role,project_desc,Role_details,project_img,v1,v2,v3,v4,v5,v6,v7):
    return f"""

    <div class="card mb-5" style="width: 40rem;">
        <img src={project_img} class="card-img-top"" display:{v7};" alt="...">
        <div class="card-header">
            <h5 class="card-title">{project_title}</h5>
        </div>
        <div class="card-body">
            <div class = "date-role">
                <h6 class="card-subtitle mb-2 text-muted "style =" display:{v1};"" display:{v2};">{start_date} - {end_date}</h6>
                <h6 class="card-subtitle mb-2 text-muted "" display:{v3};">{Role}</h6>
            </div>
            <div class = "subtitle">
                <h4 class="card-subtitle mb-2 text-muted">Description</h4>
            </div>
            <div class = "para">
                <p class="card-text"" display:{v4};">{project_desc}</p>
            </div>
            <div class = "subtitle">
                <h4 class="card-subtitle mb-2 text-muted">Tasks</h4>
            </div>
            <div class = "para">
                <p class="card-text"" display:{v5};">{Role_details}</p>
            </div>
            <div class="card-footer bg-transparent border-success"" display:{v6};">{tech}</div>
        </div>
    </div>
    """

def main():

    df = pd.read_excel(project_list)
    
    df.tech = df.tech.str.split('-')
    df = df.explode('tech', ignore_index=True)
    
    

    #  connect to the style.css
    with open("style.css") as f:
        st.markdown(f'<style>{f.read()}</style>',unsafe_allow_html=True)
    
    # connect to bootstrap
    st.markdown("""
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

        """,unsafe_allow_html=True)


    st.sidebar.markdown(
        f"""
        <div class="container">
            <img class="pp-img" src="data:image/jpeg;base64,{base64.b64encode(open(pp_img, "rb").read()).decode()}">
            <p class="pp-title">Georges Matta</p>
            <p class="pp-desc">Full Stack Developer</p>
        </div>
        """,
        unsafe_allow_html=True
    )

    st.markdown('<h1 class = "title_home" >Projects </h1>',unsafe_allow_html = True)

    
    html = convert_df(df)

    if tech := st.multiselect("tech", df.tech.unique().tolist(), key=1):
        df = df[df["tech"].isin(tech)]
    project = df.query("tech ==@tech")

    if project_title := st.multiselect("project_title", project.project_title.unique().tolist(), key=2):
        df = df[df["project_title"].isin(project_title)]


    rec = int(df.shape[0])
    st.write("{} Projects ".format(str(df['project_title'].unique().shape[0])))
    num_rows = max(1, math.ceil(rec/4))

    dv = 'inherit'
    cards = []

    for index ,row in df.iterrows():
        # with st.expander(f"st{index}"):
        #     st.write(f"st{index}")
        v1 = dv if row[1] is not None else 'none'
        v2 = dv if row[2] is not None else 'none'
        v3 = dv if row[3] is not None else 'none'
        v4 = dv if row[4] is not None else 'none'
        v5 = dv if row[5] is not None else 'none'
        v6 = dv if row[6] is not None else 'none'
        v7 = dv if row[7] is not None else 'none'
        cards.append([
            row[0],    
            row[1],
            row[2],
            row[3],
            row[5],
            row[4],
            row[6],
            row[7],
            v1,v2,v3,v4,v5,v6,v7])
    # Show the card data.
    if len(cards):
        for r in range(rec):
            # num_cols = min(4, max(1, rec))
            # c = st.columns(num_cols)
            # for m in range(num_cols):
            if len(cards):
                mycard = cards.pop(0)
                # c[m].markdown(card(*mycard), unsafe_allow_html=True)   
                st.markdown(card(*mycard), unsafe_allow_html=True)   
                    

if __name__=='__main__':
    main()

