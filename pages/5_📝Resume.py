import streamlit as st
import base64
import pandas as pd
import plotly.express as px

pp_img = 'img/pic1.jpeg'

# read pdf file
def show_pdf(file_path):
    with open(file_path,"rb") as f:
        base64_pdf = base64.b64encode(f.read()).decode('utf-8')
    pdf_display = f'<iframe src="data:application/pdf;base64,{base64_pdf}" width="800" height="800" type="application/pdf"></iframe>'
    st.markdown(pdf_display, unsafe_allow_html=True)

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

    with open("My-Cv_4-4-2023.pdf", "rb") as pdf_file:
        PDFbyte = pdf_file.read()


    st.download_button(label="download Resume",
                        data=PDFbyte,
                        file_name="test.pdf",
                        mime='application/octet-stream')


    col1,col2 = st.columns([2,1],gap="large")

    with col1:
        st.markdown("""
            <h2 class = "resume-title">About Me</h2>
            <hr class = "hr">
            <p class = "resume-desc">BS Degree (information technology and computing) seeks to gain
                experience and improve my knowledge in fields concerning IT
                (software-hardware-network) as I preferred to improve my programing
                skills because it’s my passion to become a professional and achieve
                advanced levels in programing.
                Some of my interests:
                    <ul>
                        <li> Still up-to date on any new technology especially concerning
                        developing and programing.</li>
                         <li>Interest to learn and get experience in any fields concerning
                        computers and mobile phones.</li>
                        <li> Interest in data analytics and Artificial Intelligence, NLP.</li>
                        <li> Interest in web scrapping and automation.</li>
                    </ul> 
                </p>
            """, unsafe_allow_html=True)

        st.markdown("""
            <h2 class = "resume-title">Certificates</h2>
            <hr class = "hr">
            <ul>
                <li><span class = "date-resume">Apr 2023</span> : Microsoft office specialists outlook associate(office 2019)</li>
                <li><span class = "date-resume">Mar 2023</span> : Microsoft power platform fundamentals</li>                
                <li><span class = "date-resume">May 2022</span> : Huawei Certification hcia AI</li>
                <li><span class = "date-resume">Apr 2021</span> : R & Python For Data Analysis</li>
                <li><span class = "date-resume">May 2019</span> : Python programming & automation</li>
                <li><span class = "date-resume">Dec 2018 </span>: Django Website Build</li>
            </ul> 
        
            """, unsafe_allow_html=True)

        st.markdown("""
            <h2 class = "resume-title">Work Expirience</h2>
            <hr class = "hr">
            <ul>
                <li><span class = "date-resume">2019-currently</span> : Python Developer (Data Analysis)</li>
                <li><span class = "date-resume">2016 – 2018 </span> : Python Developer -WEB developer ( Django)-UI(PYQT5)</li>
                <li><span class = "date-resume"> 2012_2015</span> : IT Support software/hardware windows-Unix(Troubleshooting-Upgrading-Maintenance)</li>
                
            </ul> 
        
            """, unsafe_allow_html=True)

        st.markdown("""
            <h2 class = "resume-title">Language Skills</h2>
            <hr class = "hr">
            <ul>
                <li><b>Arabic</b> : Fluent native language</li>
                <li><b>French</b> :  medium read, medium write, medium spoken.</li>
                <li><b>English</b> : excellent read, medium write, excellent spoken.</li>
                
            </ul> 
        
            """, unsafe_allow_html=True)


    st.markdown("""
    <h2 class = "resume-title">SKILLS</h2>
    <hr class = "hr">

    """, unsafe_allow_html=True)


    data = {
        'category': ["Programing Language","Programing Language","Programing Language", "DataBases","DataBases", "DataBases", "DataBases",  "Back-end Developer","Back-end Developer","Back-end Developer", "Front-end Developer","Front-end Developer","Front-end Developer","Front-end Developer","Data Analysis","Data Analysis","Data Analysis","Data Analysis","Data Analysis","Data Analysis","Data Analysis","OTHERS","OTHERS","OTHERS","OTHERS","OTHERS","OTHERS"],
        'skill': ['Python','javascript','PHP','MySql','MS-Server','Sqlite','PostgreSQL','Streamlit','Django','PyQt5','HTML/CSS','Ajax/JQuery','React','BootStrap/tailwinds','ML-NLP ','PowerBI','Visualization','EDA','Jupyter Notebook','Google Colab','MS excel','Windows','Linux','VSCode','VM','WAMP/XAMP','Git'],
        'percentage': ['80%', '60%', '50%', '70%','80%', '80%', '60%', '90%','80%','70%','80%', '60%', '40%', '70%','40%','50%','70%','80%','90%','90%','80%','80%','60%','70%','70%','80%','50%'],
    }
    colors = {'90%': 'red',
            '80%': 'orange',
            '70%': 'yellow',
            '60%': 'green',
            '50%': 'purple',
            '40%': 'gray'
            }

    df = pd.DataFrame(data)

    hovertemp="<br>".join([
    "<b>Skill:</b>%{customdata[0]}",
    "<b>Expirience:</b>%{customdata[1]}"
    ])
    fig = px.bar(df, y="category", orientation='h',color="percentage",text="skill",custom_data=['skill','percentage'])
    fig.update_traces(hovertemplate = hovertemp)
    fig.update_layout(
        plot_bgcolor = 'rgb(0,0,0,0)',
        paper_bgcolor='rgb(0,0,0,0)',
        legend = dict(bgcolor = 'white')

    )
    st.plotly_chart(fig,use_container_width=True)



    with col2:
        st.markdown("""
            <h2 class = "resume-title">Info</h2>
            <hr class = "hr">
            <ul>
                <li> <b>Email</b>: Georges.m.matta@gmail.com</li>
                    <li><b>Location</b>: Lebanon</li>
                <li> <b>Date Of Birth</b>: 13/2/1989</li>
                
            </ul> 
        
            """, unsafe_allow_html=True)

        st.markdown("""
            <h2 class = "resume-title">Education</h2>
            <hr class = "hr">
            <ul>
                <p class="resume-desc"> <span class = "date-resume">2009 - 2013</span> Arab Open University
                    BSc Computer Science (Information Technology and Computing)
                    GPA: 2.9_Award GPA:3.5
                    Graduation project: WEB development (Cloning FaceBook
                    social media including Google_Map)</p>
            </ul> 
        
            """, unsafe_allow_html=True)
     
       

if __name__=='__main__':
    main()