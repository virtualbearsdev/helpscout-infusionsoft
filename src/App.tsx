import HelpScout, { NOTIFICATION_TYPES } from "@helpscout/javascript-sdk";
import {
  Button,
  DefaultStyle,
  Heading,
  useSetAppHeight,
  Text,
  useHelpScoutContext,
} from "@helpscout/ui-kit";
import { useEffect, useState } from "react";
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaMagnifyingGlass } from "react-icons/fa6";
import axios from "axios";
import LoadingImg from './assets/images/loading.gif';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

function App() {
  const appRef = useSetAppHeight();
  const [userEmail, setUserEmail] = useState<string | undefined>(
    "unknown user"
  );
  const [customer, setCustomer] = useState<any | null>(null);
  const [contacts, setContacts] = useState<any | null>([]);
  const [otherContacts, setOtherContacts] = useState<any | null>([]);
  const [status, setStatus] = useState<string | undefined>("unknown status");
  const [searchBy, setSearchBy] = useState<string | undefined>('email');
  const [customerEmail, setCustomerEmail] = useState<string | undefined>('');
  const { user, conversation } = useHelpScoutContext();

  const [ifCustomer, setIfCustomer] = useState<any | null>(null);
  const [ifCustomerLoading, setIfCustomerLoading] = useState<boolean | null>(false);
  const [selectedTabs, setSelectedTabs] = useState<any | null>({});
  const [selectedOtherTabs, setSelectedOtherTabs] = useState<any | null>({});
  const [selectedCustomerTabs, setSelectedCustomerTabs] = useState<any | null>({});

  type SelectedTabs = {
    [userId: number]: 'info' | 'credits' | 'note' | 'lead';
  };

  type ActiveTabs = {
    [userId: number]: true | false;
  }

  // Get the Customer Data
  const getIfCustomerData = async (email: any) => {
    var testEmail = 'jeno@dropshiplifestyle.com';
    try {
      setIfCustomerLoading(true);
      const response = await axios.get(
        import.meta.env.VITE_APP_API_ENDPOINT + 'search-member-zendesk.php?search_type=email&search_value=' + testEmail,
        {
          headers: {
            'Content-Type': 'application/json', // Ensure it's sending as JSON
          },
        }
      );

      const { success, contacts, other_contacts } = response.data;

      if (success) {
        setContacts(contacts);
        // Initialize selectedTabs for each user to 'info' by default
        const initialTabs: SelectedTabs = {};
        contacts.forEach((user: any) => {
          initialTabs[user.id] = 'info'; // Default tab for each user
        });
        setSelectedTabs(initialTabs);
        if (other_contacts) {
          setOtherContacts(other_contacts);
          const initialTabs: SelectedTabs = {};
          other_contacts.forEach((user: any) => {
            initialTabs[user.id] = 'info'; // Default tab for each user
          });
          setSelectedOtherTabs(initialTabs);
        }
        setIfCustomerLoading(false);
      } else {
        HelpScout.showNotification(
          NOTIFICATION_TYPES.ERROR,
          "There has been an error getting the customer data, please try again!"
        );
        setIfCustomerLoading(false);
      }
    } catch (err) {
      HelpScout.showNotification(
        NOTIFICATION_TYPES.ERROR,
        "There has been an error getting the customer data, please try again!"
      );
      setIfCustomerLoading(false);
    }
  };

  // Handle tab change for a specific user
  const handleTabChange = (userId: number, tab: 'info' | 'credits' | 'note' | 'lead') => {
    setSelectedTabs((prevTabs: any) => ({
      ...prevTabs,
      [userId]: tab,
    }));
  };

  // Handle other tab change for a specific user
  const handleOtherTabChange = (userId: number, tab: 'info' | 'credits' | 'note' | 'lead') => {
    setSelectedOtherTabs((prevTabs: any) => ({
      ...prevTabs,
      [userId]: tab,
    }));
  };

  const handleCustomerTabChange = (userId: number, tab: true | false) => {
    setSelectedCustomerTabs((prevCustomerTabs: any) => ({
      ...prevCustomerTabs,
      [userId]: !tab,
    }));
  };

  useEffect(() => {
    setUserEmail(user?.email);
    setStatus(conversation?.status);

    if (conversation?.customers) {
      setCustomer(conversation.customers[0]);
      var customerData = conversation.customers[0];
      setCustomerEmail(customerData.emails[0].value);

    }
  }, [user, conversation]);

  useEffect(() => {
    if (customer?.emails && customer?.emails.length > 0) {
      var customer_email = customer.emails[0].value;
      getIfCustomerData(customer_email);
    }
  }, [customer]);

  const onClick = () => {
    HelpScout.showNotification(
      NOTIFICATION_TYPES.SUCCESS,
      "Hello from the sidebar app"
    );
  }

  return (
    <div className="App" ref={appRef}>
      <div id="content">
        <DefaultStyle />
        <div className="row">
          <div className="col-lg-12">
            <h6 className="mb-1 search-header">Search by:</h6>
            <input className="admin-name" type="hidden" />
            <div id="search-by-form">
              <div className="row">
                <div className="col-lg-6">
                  {searchBy == "email" ?
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => setSearchBy('email')} className="search-radio" name="search_radio" value="email" checked />Email
                      </label>
                    </>
                    :
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => setSearchBy('email')} className="search-radio" name="search_radio" value="email" />Email
                      </label>
                    </>
                  }
                </div>
                <div className="col-lg-6">
                  {searchBy == "first_name" ?
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => setSearchBy('first_name')} className="search-radio" name="search_radio" value="first_name" checked />First Name
                      </label>
                    </>
                    :
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => setSearchBy('first_name')} className="search-radio" name="search_radio" value="first_name" />First Name
                      </label>
                    </>
                  }
                </div>
                <div className="col-lg-6">
                  {searchBy == "last_name" ?
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => setSearchBy('last_name')} className="search-radio" name="search_radio" value="last_name" checked />Last Name
                      </label>
                    </>
                    :
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => setSearchBy('last_name')} className="search-radio" name="search_radio" value="last_name" />Last Name
                      </label>
                    </>
                  }
                </div>
                <div className="col-lg-6">
                  {searchBy == "phone" ?
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => setSearchBy('phone')} className="search-radio" name="search_radio" value="phone" checked />Phone
                      </label>
                    </>
                    :
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => setSearchBy('phone')} className="search-radio" name="search_radio" value="phone" />Phone
                      </label>
                    </>
                  }
                </div>
                <div className="col-lg-12">
                  <form className="form-inline search-form">
                    <div className="input-group mb-3">
                      <input type="text" className="form-control" id="search_value" placeholder="Search" value={customerEmail} />
                      <div className="input-group-append">
                        <button className="btn btn-primary" id="search-contact-submit"><FaMagnifyingGlass /></button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              {ifCustomerLoading ?
                <div id="loading-gif">
                  <img src={LoadingImg} />
                </div>
                :
                <>
                  {contacts && contacts.length > 0 ?
                    <>
                      <div id="contact-section">
                        <Row>
                          {contacts.map((contact: any) => {
                            const custom_fields = contact.custom_fields ?? [];
                            const tags = contact.tags ?? [];
                            const add_tags = contact.add_tag ?? [];
                            const notes = contact.notes ?? [];

                            return (
                              <Col lg="12" className={`contact-container mb-3 ${selectedCustomerTabs && selectedCustomerTabs[contact.id] ? 'active' : ''}`}>
                                <div className="card">
                                  <div className="card-header contact-header" data-val={contact.id} onClick={() => handleCustomerTabChange(contact.id, selectedCustomerTabs[contact.id] ?? false)} >
                                    <h6 className="info-header mb-0">
                                      <span>{contact.name}</span>
                                      <a className="ps-2 profile-link" target="_blank" href={`https://ue290.infusionsoft.com/Contact/manageContact.jsp?view=edit&ID=${contact.id}`}>
                                        <i className="fas fa-external-link"></i>
                                      </a>
                                      <span className="email-status" style={{ float: 'right' }}>
                                        {contact.email_status == "NonMarketable" ?
                                          <i className="fa fa-check" style={{ fontSize: '20px' }}></i>
                                          :
                                          <i className="fa fa-times" style={{ fontSize: '20px', color: 'red' }}></i>
                                        }
                                      </span>
                                    </h6>
                                  </div>
                                  <div className="card-body contact-detail-container">
                                    <div className="tab-container">
                                      {/* Tab links */}
                                      <div className="tab">
                                        <button type="button" onClick={() => handleTabChange(contact.id, 'info')} className={`tablinks contact-info ${selectedTabs[contact.id] === 'info' ? 'active' : ''}`} data-val={contact.id}>
                                          <i className="fa fa-id-card" style={{ fontSize: '15px' }}></i>
                                        </button>
                                        <button type="button" onClick={() => handleTabChange(contact.id, 'credits')} className={`tablinks contact-coaching ${selectedTabs[contact.id] === 'credits' ? 'active' : ''}`} data-val={contact.id}>
                                          <i className="fa fa-users" style={{ fontSize: '15px' }}></i>
                                        </button>
                                        <button type="button" onClick={() => handleTabChange(contact.id, 'note')} className={`tablinks contact-note ${selectedTabs[contact.id] === 'note' ? 'active' : ''}`} data-val={contact.id}>
                                          <i className="fa fa-pen" style={{ fontSize: '15px' }}></i>
                                        </button>
                                        {/* <button className="tablinks contact-call" data-val={contact.id}>
                                        <i className="fa fa-phone" style={{fontSize: '20px'}}></i>
                                      </button> */}
                                        <button type="button" onClick={() => handleTabChange(contact.id, 'lead')} className={`tablinks contact-hot-lead ${selectedTabs[contact.id] === 'lead' ? 'active' : ''}`} data-val={contact.id}>
                                          <i className="fa fa-plus" style={{ fontSize: '15px' }}></i>
                                        </button>
                                      </div>
                                    </div>
                                    <div className="tab-contents pt-3 pe-3 ps-3 pb-2">
                                      <div className={`tab-content contact-info-content ${selectedTabs[contact.id] === 'info' ? 'active' : ''}`}>
                                        <div className="row">
                                          <div className="col-lg-12">
                                            {/* <!-- <h6 className="info-header">Email <span className="mb-0 ps-3" style="font-weight: 400">Status: <span className="email-status">{{contact.email_status}}</span></span></h6> --> */}
                                            <p className="info-content"><span><i className="fa-regular fa-envelope info-icons"></i></span>  {contact.email}</p>
                                          </div>
                                          <div className="col-lg-12">
                                            {contact.phone &&
                                              <p className="info-content"><span><i className="fa-solid fa-phone info-icons"></i></span>{contact.phone}</p>
                                            }
                                          </div>
                                          <div className="col-lg-12">
                                            {custom_fields && custom_fields.length > 0 ?
                                              <>
                                                {custom_fields.map((custom_field: any) => (
                                                  <>
                                                    {custom_field.id == 287 && custom_field.content &&
                                                      <p className="info-content"><span><i className="fa-brands fa-discord info-icons"></i></span>{custom_field.content}</p>
                                                    }
                                                    {custom_field.id == 233 && custom_field.content &&
                                                      <p className="info-content"><span><i className="fa-solid fa-shirt info-icons"></i></span>{custom_field.content}</p>
                                                    }
                                                    {custom_field.id == 137 && custom_field.content &&
                                                      <p className="info-content"><span><i className="fa-solid fa-d info-icons" ></i></span>{custom_field.content}</p>
                                                    }
                                                    {custom_field.id == 291 && custom_field.content &&
                                                      <p className="info-content" id="coaching-link" data-val={custom_field.content}><span><i className="fa-solid fa-user info-icons"></i></span><span id="coaching-text">Coaching w/ Anton</span></p>
                                                    }
                                                  </>
                                                ))}
                                              </>
                                              :
                                              null
                                            }
                                          </div>
                                          <div className="col-lg-12">
                                            {tags && tags.length > 0 ?
                                              <>
                                                <h6 className="tags-header">Tags</h6>
                                                <div className="tags-container">
                                                  {tags.map((tag: any) => (
                                                    <>
                                                      <div className="tags-details">
                                                        <div className="tag-header-container">
                                                          {tag.id == 40871 && tag.name ?
                                                            <a href="https://ue290.infusionsoft.com/ContactGroup/manageContactGroup.jsp?view=edit&ID=40871" target="_blank">
                                                              <p className="tag-header">{tag.name}</p>
                                                            </a>
                                                            : tag.id == 42324 && tag.name ?
                                                              <a href="https://ue290.infusionsoft.com/ContactGroup/manageContactGroup.jsp?view=edit&ID=42324" target="_blank">
                                                                <p className="tag-header">{tag.name}</p>
                                                              </a>
                                                              :
                                                              <p className="tag-header">{tag.name}</p>
                                                          }
                                                        </div>
                                                        <div className="tag-date-container">
                                                          <p className="tag-date mb-0">{tag.date_applied}</p>
                                                        </div>
                                                      </div>
                                                    </>
                                                  ))}
                                                </div>
                                              </>
                                              :
                                              null
                                            }
                                            {add_tags && add_tags.length > 0 &&
                                              <div className="col-lg-12 px-0 tag-selection-container">
                                                <div className="input-group mb-3">
                                                  <select name="tags_selection" className="form-control select-tag" id="tag-select-{{contact.id}}">
                                                    <option hidden selected value="">Select a tag</option>
                                                    {add_tags.map((add_tag: any) => (
                                                      <option value={add_tag.id}>{add_tag.name}</option>
                                                    ))}
                                                  </select>
                                                  <button className="btn add-tag-btn" data-val={contact.id}>Add</button>
                                                </div>
                                                {/* <p id="tag-error">Please select a tag!</p> */}
                                              </div>
                                            }
                                          </div>
                                        </div>
                                      </div>
                                      <div className={`tab-content contact-coaching-content ${selectedTabs[contact.id] === 'credits' ? 'active' : ''}`}>
                                        <div className="row">
                                          <div className="col-lg-12">
                                            {custom_fields && custom_fields.length > 0 ?
                                              <>
                                                {custom_fields.map((custom_field: any) => (
                                                  <>
                                                    {custom_field.id == 292 && custom_field.content &&
                                                      <p className="info-content"><span><i className="fa-solid fa-coins info-icons"></i></span>{custom_field.content} <span></span></p>
                                                    }
                                                    {custom_field.id == 300 && custom_field.content ?
                                                      <p className="info-content"><span><i className="fas fa-calendar-times info-icons"></i></span>{custom_field.content} <span></span></p>
                                                      : custom_field.id == 300 && !custom_field.content ?
                                                        <p className="info-content"><span><i className="fas fa-calendar-times info-icons"></i></span>- <span></span></p>
                                                        :
                                                        null
                                                    }

                                                  </>
                                                ))}
                                              </>
                                              :
                                              null
                                            }
                                          </div>
                                        </div>
                                      </div>
                                      <div className={`tab-content contact-note-content ${selectedTabs[contact.id] === 'note' ? 'active' : ''}`}>
                                        <div className="row">
                                          <div className="col-lg-12">
                                            <h6 className="tags-header mb-2 mt-0">Add Note</h6>
                                            <input type="text" placeholder="Title" className="form-control mb-3" id="note-title-{{contact.id}}" />
                                            <textarea placeholder="Note" className="form-control" id="note-{{contact.id}}" rows="3"></textarea>
                                            {/* <p id="note-error">Please fill up all fields!</p>
                                          <p id="note-success">Note added successfully!</p> */}
                                            <button className="btn add-note-btn" data-val={contact.id}>Add</button>
                                            {notes && notes.length > 0 ?
                                              <>
                                                <h6 className="tags-header mb-2 mt-3">Notes</h6>
                                                {notes.map((note: any) => (
                                                  <>
                                                    <div className="card mb-3 note-card">
                                                      <div className="card-header p-2 fs-12">
                                                        {note.title}({note.type}) - {note.date_created} <i className="fa fa-chevron-down"></i>
                                                      </div>
                                                      <div className="card-body p-2">
                                                        {note.body}
                                                      </div>
                                                    </div>

                                                  </>
                                                ))}
                                              </>
                                              :
                                              null
                                            }
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Col>
                            )
                          })}
                        </Row>
                      </div>
                    </>
                    :
                    <div id="error-div">
                      No records found
                    </div>
                  }
                </>
              }

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
