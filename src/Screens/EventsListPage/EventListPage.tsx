import React, { useEffect } from "react";
import { Row, Col, Space, Input, Switch } from "antd";
import EventCard from "../../Components/EventCard/EventCard";
import Header from "../../Components/Header/Header";
import { useParams } from "react-router-dom";
import {
  Cats,
  EventDetailsType,
  backendURI,
  EventCategories,
  PropTypes,
} from "../../data";
import { useState } from "react";
import Footer from "../../Components/Footer/Footer";
import Loading from "../../Components/Loading/Loading";
import allEvents from "../../assets/header_default.jpg";

interface ParamTypes {
  cId: string;
}
function isRegistered(
  userEvents: PropTypes["userDetails"]["eventDetails"],
  eventId: number
) {
  for (let i in userEvents) {
    if (userEvents[i].event == eventId) return true;
  }
  return false;
}

export default function EventListPage(props: PropTypes) {
  let { cId } = useParams<ParamTypes>();
  const [isCatFound, setisCatFound] = useState(false);
  const [catIdx, setCatIdx] = useState(0);
  const [isLoading, setisLoading] = useState(true);
  const [SearchTerm, setSearchTerm] = useState("");
  const [Toggle, setToggle] = useState(false);
  const [allCatsEvents, setallCatsEvents] = useState<EventDetailsType[]>([]);
  const Toggler = () => {
    Toggle ? setToggle(false) : setToggle(true);
  };

  useEffect(() => {
    if (cId == "all-events" && props.categories) {
      let as: EventDetailsType[] = [];
      for (let i = 0; i < props.categories.length; i++) {
        for (let j = 0; j < props.categories[i].events.length; j++) {
          as.push(props.categories[i].events[j]);
        }
      }
      setallCatsEvents(as);
      setisCatFound(true);
      setisLoading(false);
    } else {
      for (let i = 0; i < props.categories.length; i++) {
        if (props.categories[i].slug == cId) {
          setisCatFound(true);
          setisLoading(false);
          setCatIdx(i);
          break;
        } else if (i == props.categories.length - 1) {
          setisCatFound(false);
          setisLoading(false);
        }
      }
    }
  }, [props.categories]);

  return (
    <>
      <Loading loading={props.catLoading} />
      <Header
        showBack={true}
        mainText={
          isCatFound
            ? cId == "all-events"
              ? "All Events"
              : props.categories[catIdx].name
            : "Loading.."
        }
        dashimg={
          isCatFound
            ? cId == "all-events"
              ? allEvents
              : backendURI.slice(0, -1) + props.categories[catIdx].bgImage?.url
            : undefined
        }
        user={props.user}
      />
      {isLoading ? (
        <div>Loading..</div>
      ) : isCatFound ? (
        <div>
          <div
            className="center-align"
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              margin: "auto",
            }}
          >
            <div style={{ maxWidth: "500px", margin: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ background: "rgba(255,255,255,0.1)" }}>
                  <Input.Search
                    data-test-id="search-inp"
                    style={{ width: "280px" }}
                    size="large"
                    placeholder="SEARCH...."
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                    }}
                  />
                </div>
                <Row style={{ marginTop: "15px", width: "100%" }}>
                  <Col span={18} style={{ textAlign: "left" }}>
                    <h4>Show open for registration only</h4>
                  </Col>
                  <Col span={6} style={{ textAlign: "right" }}>
                    <Switch
                      data-test-id="toggle-btn"
                      style={{ marginLeft: "10px" }}
                      onClick={Toggler}
                    />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
          <div style={{ width: "800px", maxWidth: "95vw", margin: "auto" }}>
            {cId == "all-events"
              ? allCatsEvents.sort((a,b)=>{
                if (a.name > b.name)
                return 1
                else return -1
              }).filter((val) => {
                    if (Toggle) {
                      if (val.isRegOpen) return val;
                    } else return val;
                  })
                  .map((value) => {
                    if (SearchTerm !== "") {
                      if (
                        value.name
                          .toLowerCase()
                          .includes(SearchTerm.toLowerCase())
                      )
                        return (
                          <EventCard
                            {...value}
                            key={value.slug}
                            isReg={
                              props.user.isLoggedIn
                                ? isRegistered(
                                    props.userDetails.eventDetails,
                                    value.id
                                  )
                                : false
                            }
                          />
                        );
                    } else
                      return (
                        <EventCard
                          {...value}
                          key={value.slug}
                          isReg={
                            props.user.isLoggedIn
                              ? isRegistered(
                                  props.userDetails.eventDetails,
                                  value.id
                                )
                              : false
                          }
                        />
                      );
                  })
              : props.categories[catIdx].events
                  .filter((val) => {
                    if (Toggle) {
                      if (val.isRegOpen) return val;
                    } else return val;
                  })
                  .map((value) => {
                    if (SearchTerm !== "") {
                      if (
                        value.name
                          .toLowerCase()
                          .includes(SearchTerm.toLowerCase())
                      )
                        return (
                          <EventCard
                            {...value}
                            key={value.slug}
                            isReg={
                              props.user.isLoggedIn
                                ? isRegistered(
                                    props.userDetails.eventDetails,
                                    value.id
                                  )
                                : false
                            }
                          />
                        );
                    } else
                      return (
                        <EventCard
                          {...value}
                          key={value.slug}
                          isReg={
                            props.user.isLoggedIn
                              ? isRegistered(
                                  props.userDetails.eventDetails,
                                  value.id
                                )
                              : false
                          }
                        />
                      );
                  })}
          </div>
          <Footer />
        </div>
      ) : (
        <div>404!!!</div>
      )}
    </>
  );
}
