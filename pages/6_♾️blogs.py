import streamlit as st
import base64

pp_img = 'img/pic1.jpeg'

def main():
    #  connect to the style.css
    with open("style.css") as f:
        st.markdown(f'<style>{f.read()}</style>',unsafe_allow_html=True)

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

    st.markdown('<h1 class = "title_home" >Blogs </h1>',unsafe_allow_html = True)

    blog1 = 'img/blog1.jpeg'
    st.markdown(
        f"""
        <div class="container">
            <h3 class = "blog-title">My Journey in learning data analysis (Self teaching).</h3>
            <img class="blog-img" src="data:image/jpeg;base64,{base64.b64encode(open(blog1, "rb").read()).decode()}">
            <p class = "blog-text">This is my first story on medium, after i was used to read and learn from writers (data analysts, programmers…)on this forum i thought, why not to start writing and share my learning and knowledge after 3 years in this field. This post will talks about data Analyst difficulties that will slap you in the face during the data analysis process in order to achieve the required result. Hopefully this will help anyone want to start data analysis and machine learning later on....
            <p>
            <a href = "https://medium.com/@testdevleb/my-journey-in-learning-data-analysis-7c6b45f3c472" class="blog-link">Read More</p>
        </div>
        """,
        unsafe_allow_html=True
    )
    st.markdown('---')


if __name__=='__main__':
    main()
