import streamlit as st
import base64

pp_img = 'img/pic1.jpeg'

def main():
    ''''
    connect to the CSS file 
    '''
    with open("style.css") as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)
    st.sidebar.markdown(f"""
        <div class="container">
            <img class="pp-img" src="data:image/jpeg;base64,{base64.b64encode(open(pp_img, "rb").read()).decode()}">
            <p class="pp-title">Georges Matta</p>
            <p class="pp-desc">Full Stack Developer</p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown('<h1 class = "title_home" >Work Expirience </h1>', unsafe_allow_html=True)

    st.markdown("""
        <div class="container-work">
            <h2 class = "work-title">Python Developer(Data Analyst)</h2>
            <h4 class = "work-date">2019-Currently</h4>
            <p class = "work-desc">First i was using excel and some PowerBI, than once i learned about streamlit this was the major transfer in my Career as Data analyst and Web developer.During my daily tasks i had to analyse the recieved data  from multiple sources and in different format.
                <ul>
                    <li> collect Data from multiple sources including files and databses.</li>
                    <li> Clean the data to meet our requirement and being able to work on it.</li>
                    <li> Analyse the data and tell story using dashbords.</li>
                </ul>
            </p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown('---')
    st.markdown("""
        <div class="container-work">
            <h2 class = "work-title">Python Developer</h2>
            <h4 class = "work-date">2016-2018</h4>
            <p class = "work-desc">I worked as Web Developer & Apps creator using Django framework for web and PyQt5 for apps.
                <ul>
                    <li> Lead the team by divinding tasks (back-end,front-end,test-unit,QA,deployment).</li>
                    <li> Check the user requirement and needs in order to create the web or app features & functions.</li>
                    <li> recheck the project at each phase.</li>
                    <li> performing the testing-unit and QA in order to ensure the efficiency and satisfaction of the client.</li>
                    <li> Suppervise the deployment on servers or stand alon computers with all the nessesary packages.</li>
                </ul>
            </p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown('---')
    st.markdown("""
        <div class="container-work">
            <h2 class = "work-title">IT Support</h2>
            <h4 class = "work-date">2012-2014</h4>
            <p class = "work-desc">First Job in the IT field where i started learning about computers, Network and servers.
                <ul>
                    <li> Perform format to the computers and install OS (Windows, Linux) and required softwares.</li>
                    <li>Network maintenance and troubleshooting.</li>
                    <li>Server maintenance software/hardware.</li>
                </ul>
            </p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown('---')

    

if __name__=='__main__':
    main()