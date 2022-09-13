import streamlit as st
import pandas as pd
import numpy as np
from PIL import Image
import base64

# st.title('Uber pickups in NYC')
# st.write("test")
pp_img = 'img/pic1.jpeg'
# testv = 'test'

def main():
    #  connect to the style.css
    with open("style.css") as f:
        st.markdown(f'<style>{f.read()}</style>',unsafe_allow_html=True)
    
    # with open("F:/venv/portfolio/hello.gif", "rb") as file_:
    #     contents = file_.read()
    #     data_url = base64.b64encode(contents).decode("utf-8")
    # st.markdown(
    #     f'<img class = "hello" src="data:image/gif;base64,{data_url}" alt="cat gif">',
    #     unsafe_allow_html=True,
    # )

    st.markdown('<h1 class = "title_home" >My PortFolio </h1>',unsafe_allow_html = True)

    # # add Gif image  
    # st.markdown("![Alt Text](https://media.giphy.com/media/gM5qFksULw54NMWyry/giphy.gif)")

    
  

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
    # if 'pp_img' not in st.session_state:
    #     st.session_state['pp_img'] = pp_img
    
    # st.write(st.session_state)
    
    st.markdown('<h3 class = "home-text-intro">Thanks for visiting my portfolio.\
     Allow me to introduce myself in order to know me better. you can get more details about me by checking the pages on the left sidebar.</h3>',unsafe_allow_html=True)

    st.markdown('<h3 class = "home-text-p1">While creating this Portofolio I had so much fun  & learned more about the amaizing Streamlit package. Also it tooks me 3 days & 12 cup of coffe and some snacks... </h3>',unsafe_allow_html=True)



if __name__=='__main__':
    main()
