import React, { useEffect, useState } from "react";
import {
  Button,
  Tabs,
  Card,
  Carousel,
  Image,
  Typography,
  message,
  Alert,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import Header from "../../Components/Header/Header";
import { useParams, Link, useHistory } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Footer from "../Footer/Footer";
import {
  EventById,
  EventsInCategory,
  PropTypes,
  RegEventDetail,
} from "../../data";
import { backendURI } from "../../data";
import dayjs from "dayjs";
import Loading from "../Loading/Loading";
const { TabPane } = Tabs;
interface ParamTypes {
  eId: string;
}
interface EventDetailsProps extends PropTypes {
  getUserEvents: () => void;
}
function showRegButton(
  eventDetailsX: PropTypes["userDetails"]["eventDetails"],
  curEventId: number
) {
  if (eventDetailsX)
    for (let index = 0; index < eventDetailsX.length; index++) {
      if (curEventId == eventDetailsX[index].event) {
        return false;
      }
    }
  return true;
}

function NewlineText(text: string) {
  if (!text) return [];
  const newText = text
    .split("\n")
    .map((str) => <Typography.Paragraph>{str}</Typography.Paragraph>);

  return newText;
}
export default function EventDetails(props: EventDetailsProps) {
  let { eId } = useParams<ParamTypes>();
  const [isEventFound, setisEventFound] = useState(false);
  const [isLoading, setisLoading] = useState(true);
  const [catCount, setCatCount] = useState(0);
  const [eventCount, seteventCount] = useState(0);
  const [Registerbtntext, setRegisterbtntext] = useState("Register");
  const [currentEventid, setcurrentEventid] = useState(0);
  const history = useHistory();
  useEffect(() => {
    for (let i = 0; i < props.categories.length; i++) {
      for (let j = 0; j < props.categories[i].events.length; j++) {
        if (props.categories[i].events[j].slug == eId) {
          setCatCount(i);
          setisEventFound(true);
          seteventCount(j);
          setisLoading(false);
          setcurrentEventid(props.categories[i].events[j].id);
          console.log("got");
          break;
        }
      }
    }
    setisLoading(props.catLoading);
  }, [props.categories, props.catLoading]);

  function register() {
    console.log("eventId", currentEventid);
    setRegisterbtntext("Loading..");
    fetch(backendURI + "user-event-details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + props.user.token,
      },
      body: JSON.stringify({
        user: {
          id: props.user.id,
        },
        event: {
          id: currentEventid,
        },
      }),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          if(result.statusCode){
            message.error(result.message, 5);
          }
           else {
          props.getUserEvents();
          message.success("Registration successful!");
          history.push("/myreg/"+props.categories[catCount].events[eventCount].slug)
          console.log(result);
           }
        },
        (error) => {
          console.log(error);
          message.error("Registration was unsuccesful. Please try again");
        }
      );
  }

  return (
    <>
    <Loading loading={isLoading} />
      <Header
        mainText={
          isEventFound
            ? props.categories[catCount].events[eventCount].name
            : "Loading..."
        }
        showBack={true}
        dashimg={
          isEventFound
            ? backendURI.slice(0, -1) +
              props.categories[catCount].events[eventCount].coverImage?.url
            : undefined
        }
        user={props.user}
      />

      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {isLoading ? (
          <div> Loading... </div>
        ) : isEventFound ? (
          <>
            {showRegButton(props.userDetails.eventDetails, currentEventid) && (
              <h3 style={{ fontWeight: "bold" }}>
                {props.categories[catCount].events[eventCount].isRegOpen
                  ? "Registration open"
                  : dayjs(
                      props.categories[catCount].events[eventCount].regStartDate
                    ).diff(dayjs()) < 0
                  ? "Registration closed"
                  : "Registration starts on " +
                    dayjs(
                      props.categories[catCount].events[eventCount].regStartDate
                    ).format("DD MMMM hh:mm a ")}
              </h3>
            )}

            <div style={{ display: "inline-block", marginBottom: "15px" }}>
              {props.user.isLoggedIn
                ? showRegButton(
                    props.userDetails.eventDetails,
                    currentEventid
                  ) &&
                  props.categories[catCount].events[eventCount].isRegOpen &&
                  props.userDetails.name &&
                  props.userDetails.phoneNumber &&
                  props.userDetails.collegeName && (
                    <Button
                      type="primary"
                      className="buttons"
                      id="EventDetails_RegButton"
                      icon={<DownloadOutlined />}
                      onClick={() => register()}
                    >
                      {Registerbtntext}
                    </Button>
                  )
                : props.categories[catCount].events[eventCount].isRegOpen && (
                    <a
                      href={backendURI + "connect/google"}
                      onClick={() => {
                        localStorage.setItem("navTo", "/event/" + eId);
                      }}
                    >
                      <Button
                        type="primary"
                        className="buttons"
                        id="EventDetails_LoginButton"
                      >
                        Register
                      </Button>
                    </a>
                  )}
              {props.user.isLoggedIn &&
                props.categories[catCount].events[eventCount].isRegOpen &&
                (!props.userDetails.name ||
                  !props.userDetails.collegeName ||
                  !props.userDetails.phoneNumber) && (
                  <Link
                    to={"/editprofile/" + eId}
                    id="EventDetail_CompleteRegistrationButton"
                  >
                    <Button type="primary" className="buttons">
                      Complete Your Profile to Continue
                    </Button>
                  </Link>
                )}

              {props.user.isLoggedIn &&
                !showRegButton(
                  props.userDetails.eventDetails,
                  currentEventid
                ) &&
                props.userDetails.name &&
                props.userDetails.phoneNumber &&
                props.userDetails.collegeName && (
                  <Link to={"/myreg/" + eId} id="EventDetail_myregButton">
                    <Button type="primary" className="buttons" block={true}>
                      My Registration
                    </Button>
                  </Link>
                )}
            </div>
            <div>
              <Tabs
                defaultActiveKey="1"
                centered
                tabBarGutter={16}
              >
                <TabPane
                  tab="Description"
                  key="1"
                  style={{ width: "800px", maxWidth: "95vw", margin: "auto" }}
                >

                  <Card data-test-id='description-card' className="card">

                    {props.categories[catCount].events[eventCount].posterImage
                      .length != 0 && (
                      <div className="noscroll">
                        <div
                          style={{ whiteSpace: "nowrap", overflowX: "auto" }}
                        >
                          {props.categories[catCount].events[
                            eventCount
                          ].posterImage.map((val) => {
                            return (
                              <Image
                                style={{
                                  padding: "5px",
                                }}
                                width={300}
                                src={backendURI.slice(0, -1) + val.url}
                              />
                            );
                          })}
                        </div>
                        <Alert
                          style={{
                            transform: "scale(0.7)",
                            marginBottom: "15px",
                          }}
                          message="Tap on the image to enlarge"
                          showIcon
                          type="info"
                        />
                      </div>
                    )}
                    <Typography.Paragraph>
                      {
                        props.categories[catCount].events[eventCount]
                          .description
                      }
                    </Typography.Paragraph>
                  </Card>
                </TabPane>
                <TabPane
                  tab="Rules"
                  key="2"
                  style={{ width: "800px", maxWidth: "95vw", margin: "auto" }}
                >

                  <Card data-test-id='rules-card' className="card">
                    <a href="https://api.ragam.live/uploads/Event_Guidelines_R_21_971f110b9f.pdf" target="_blank" ><h4> General guidelines: <u>see here</u></h4></a>
                    <h4 style={{marginTop:"10px"}}><u>Event Guidelines</u></h4>
                    {NewlineText(
                      props.categories[catCount].events[eventCount].rules
                    ).map((val) => {
                      return val;
                    })}
                  </Card>
                </TabPane>
                <TabPane
                  tab="Contact"
                  key="3"
                  style={{ width: "800px", maxWidth: "95vw", margin: "auto" }}
                >
                  <Card data-test-id='contact-card' className="card">
                    {props.categories[catCount].events[eventCount].contacts.map(
                      (contact) => {
                        return (
                          <>
                            <h3>{contact.name}</h3>
                            <h5>{contact.phoneNumber}</h5>
                            <br />
                          </>
                        );
                      }
                    )}
                  </Card>
                </TabPane>
                
                  <TabPane
                    tab="Results"
                    key="4"
                    style={{ width: "800px", maxWidth: "95vw", margin: "auto" }}
                  >

                    <Card data-test-id='result-card'  >

                      {props.categories[catCount].events[eventCount].result? 
                     <div style={{whiteSpace:"pre-wrap"}} className="card-result">{props.categories[catCount].events[eventCount].result}
                       </div> 
                      :"Nothing here yet"}
                    </Card>
                  </TabPane>
                )
              </Tabs>
            </div>
          </>
        ) : (
          <div> 404!! </div>
        )}
        <Footer/>
      </div>
    </>
  );
}
