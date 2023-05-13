<<<<<<< HEAD
import streamlit as st
import base64
import numpy as np

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

# st.markdown('---')
tab1, tab2 = st.tabs(["📈 Education", "🗃 Certificate"])


tab1.subheader("Education")

tab1.markdown("""
    <div class="container-work">
        <h2 class = "work-title">Arab Open University</h2>
        <h4 class = "work-date">2009-2013</h4>
        <h5 class = "work-date">BS Computer Science(Information Technology & Computing)</h5>
        <ul>
            <li> GPA 2.9 Award GPA 3.5.</li>
            <li> Graduation Project: Web Development(cloning Facebook--social media including Google Map).</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)


tab2.subheader("Certificate")
tab2.markdown("""
        <div class="container-work">
            <h2 class = "work-title">Microsoft office specialists outlook associate(office 2019)</h2>
            <h4 class = "work-date">Issued Apr 2023</h4>
            <h4 class = "work-date">Credential ID wEVPC-48Xr</h4>
            
        </div>
        """, unsafe_allow_html=True)


tab2.markdown('---')

tab2.markdown("""
        <div class="container-work">
            <h2 class = "work-title">Microsoft power platform fundamentals</h2>
            <h4 class = "work-date">Issued Mar 2023</h4>
            <h4 class = "work-date">Credential ID wBrMA-2Fb6</h4>
            
        </div>
        """, unsafe_allow_html=True)
        
tab2.markdown('---')

tab2.markdown("""
    <div class="container-work">
        <h2 class = "work-title">Huawei Certification hcia AI</h2>
        <h4 class = "work-date">March 2022-May 2022</h4>
    </div>
    """, unsafe_allow_html=True)

tab2.markdown('---')

tab2.markdown("""
    <div class="container-work">
        <h2 class = "work-title">R & Python For Data Analysis</h2>
        <h4 class = "work-date">Jan 2021-April 2021</h4>
    </div>
    """, unsafe_allow_html=True)

tab2.markdown('---')

tab2.markdown("""
    <div class="container-work">
        <h2 class = "work-title">Python programming & automation</h2>
        <h4 class = "work-date">Jan 2019-May 2019</h4>
    </div>
    """, unsafe_allow_html=True)

tab2.markdown('---')

tab2.markdown("""
    <div class="container-work">
        <h2 class = "work-title">Django Website Build</h2>
        <h4 class = "work-date">Oct 2018-Dec 2018</h4>
    </div>
    """, unsafe_allow_html=True)


if __name__=='__main__':
=======
import streamlit as st
import base64
import numpy as np

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

# st.markdown('---')
tab1, tab2 = st.tabs(["📈 Education", "🗃 Certificate"])


tab1.subheader("Education")

tab1.markdown("""
    <div class="container-work">
        <h2 class = "work-title">Arab Open University</h2>
        <h4 class = "work-date">2009-2013</h4>
        <h5 class = "work-date">BS Computer Science(Information Technology & Computing)</h5>
        <ul>
            <li> GPA 2.9 Award GPA 3.5.</li>
            <li> Graduation Project: Web Development(cloning Facebook--social media including Google Map).</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)


tab2.subheader("Certificate")
tab2.markdown("""
        <div class="container-work">
            <h2 class = "work-title">Microsoft office specialists outlook associate(office 2019)</h2>
            <h4 class = "work-date">Issued Apr 2023</h4>
            <h4 class = "work-date">Credential ID wEVPC-48Xr</h4>
            
        </div>
        """, unsafe_allow_html=True)


tab2.markdown('---')

tab2.markdown("""
        <div class="container-work">
            <h2 class = "work-title">Microsoft power platform fundamentals</h2>
            <h4 class = "work-date">Issued Mar 2023</h4>
            <h4 class = "work-date">Credential ID wBrMA-2Fb6</h4>
            
        </div>
        """, unsafe_allow_html=True)
        
tab2.markdown('---')

tab2.markdown("""
    <div class="container-work">
        <h2 class = "work-title">Huawei Certification hcia AI</h2>
        <h4 class = "work-date">March 2022-May 2022</h4>
    </div>
    """, unsafe_allow_html=True)

tab2.markdown('---')

tab2.markdown("""
    <div class="container-work">
        <h2 class = "work-title">R & Python For Data Analysis</h2>
        <h4 class = "work-date">Jan 2021-April 2021</h4>
    </div>
    """, unsafe_allow_html=True)

tab2.markdown('---')

tab2.markdown("""
    <div class="container-work">
        <h2 class = "work-title">Python programming & automation</h2>
        <h4 class = "work-date">Jan 2019-May 2019</h4>
    </div>
    """, unsafe_allow_html=True)

tab2.markdown('---')

tab2.markdown("""
    <div class="container-work">
        <h2 class = "work-title">Django Website Build</h2>
        <h4 class = "work-date">Oct 2018-Dec 2018</h4>
    </div>
    """, unsafe_allow_html=True)


if __name__=='__main__':
>>>>>>> c27e57e01fec42161ff6f024ae5307a0aa6427ee
    main()