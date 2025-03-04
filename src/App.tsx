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
import React, { useRef } from "react";

const initialNoteData = Object.freeze({
  contact_id: '',
  body: '',
  type: 'Other',
  title: '',
});

function App() {
  const appRef = useSetAppHeight();
  const [userEmail, setUserEmail] = useState<string | undefined>(
    "unknown user"
  );
  const textAreaRef = useRef(null);
  const [customer, setCustomer] = useState<any | null>(null);
  const [contacts, setContacts] = useState<any | null>([]);
  const [otherContacts, setOtherContacts] = useState<any | null>([]);
  const [status, setStatus] = useState<string | undefined>("unknown status");
  const [searchBy, setSearchBy] = useState<string | undefined>('email');
  const [customerEmail, setCustomerEmail] = useState<string | undefined>('');
  const { user, conversation } = useHelpScoutContext();
  const [searchValue, setSearchValue] = useState<any | null>(null);
  const [selectedTag, setSelectedTag] = useState<any | null>(null);
  const [tagLoading, setTagLoading] = useState<{ [key: string]: boolean }>({});
  const [noteLoading, setNoteLoading] = useState<{ [key: string]: boolean }>({});
  const [noteFormData, setNoteFormData] = useState<any | null>(initialNoteData);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [addLeadLoading, setAddLeadLoading] = useState<{ [key: string]: boolean }>({});
  const [leadDescription, setLeadDescription] = useState<any | null>(null);
  const [leadPhoneNumber, setLeadPhoneNumber] = useState<any | null>(null);
  const [leadRadio, setLeadRadio] = useState<any | null>('Yes');
  const [leadSource, setLeadSource] = useState<any | null>('Help Scout');
  const [leadEmail, setLeadEmail] = useState<any | null>(null);
  const [leadTeamEmail, setLeadTeamEmail] = useState<any | null>(null);

  const [ifCustomer, setIfCustomer] = useState<any | null>(null);
  const [ifCustomerLoading, setIfCustomerLoading] = useState<boolean | null>(false);
  const [selectedTabs, setSelectedTabs] = useState<any | null>({});
  const [initialTabNavigation, setInitialTabNavigation] = useState<any | null>('info');
  const [selectedOtherTabs, setSelectedOtherTabs] = useState<any | null>({});
  const [selectedCustomerTabs, setSelectedCustomerTabs] = useState<any | null>({});
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(false);
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);


  const [messages, setMessages] = useState<any | null>([]);
  const [messagesReady, setMessagesReady] = useState<boolean | null>(false);
  const [messagesLoading, setMessagesLoading] = useState<boolean | null>(true);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [messageResponse, setMessageResponse] = useState<any | null>('');

  type SelectedTabs = {
    [userId: number]: 'info' | 'credits' | 'note' | 'lead' | 'messages';
  };

  type ActiveTabs = {
    [userId: number]: true | false;
  }

  // Send the conversation to N8N
  const postMessages = async () => {
    setMessagesLoading(true);
    try {
      const response = await axios.post(
        `https://n8n.dropshiplifestyle.org/webhook/e31e7033-5eb1-4643-a39e-607755aa0ee6`,
        // `https://n8n.dropshiplifestyle.org/webhook-test/e31e7033-5eb1-4643-a39e-607755aa0ee6`,
        { messages: messages, conversation: conversation },
        {
          headers: {
            'x-special-key': `dr0psh1pl1f3styl3`,
            'Content-Type': 'application/json',
          },
        }
      );
      // console.log(response.data);
      if (response.data.content) {
        setMessageResponse(response.data.content);
      }
      setMessagesLoading(false);
    } catch (err) {
      HelpScout.showNotification(
        NOTIFICATION_TYPES.ERROR,
        "There has been an error sending the messages data, please try again!"
      );
    }
  };

  const copyToClipboard = (event: any, text: any) => {
    // Create a temporary textarea element
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);

    // Select the text
    tempTextArea.select();
    tempTextArea.setSelectionRange(0, 99999); // For mobile support

    // Copy to clipboard
    const success = document.execCommand("copy");
    document.body.removeChild(tempTextArea); // Clean up

    if (success) {
      HelpScout.showNotification(
        NOTIFICATION_TYPES.SUCCESS,
        'Copied to clipboard!'
      );
    } else {
      console.error("Copy command failed");
      HelpScout.showNotification(
        NOTIFICATION_TYPES.ERROR,
        'Failed to copy text!'
      );
    }
  };

  const fetchMessages = async (conversationId: any) => {
    try {
      const response = await axios.get(`https://manhattan-theme-generator.jenocabrera.tech/api/helpscout/conversation/${conversationId}/messages`, {
        headers: {
          'x-special-key': `dr0psh1pl1f3styl3`,
          'Content-Type': 'application/json',
        },
      });

      var status = response.data.status;
      if (status == "Success") {
        var conversationData = response.data.conversation;
        setMessages(conversationData._embedded.threads);
        setMessagesReady(true);
        // console.log(conversationData._embedded.threads);
      }
    } catch (err) {
      HelpScout.showNotification(
        NOTIFICATION_TYPES.ERROR,
        "There has been an error getting the messages data, please try again!"
      );
    }
  };

  const handleSearchChange = (e: any) => {
    setSearchValue(e.target.value);
  }

  const handleTagChange = (e: any) => {
    setSelectedTag(e.target.value);
  }

  const handleSearchTypeChange = (searchBy: any) => {
    setSearchBy(searchBy);
    setSearchValue('');
  }

  const handleChangeNote = (e: any) => {
    setNoteFormData({
      ...noteFormData,
      [e.target.name]: e.target.value,
    });
  }

  const handleChangeAddLeadEmail = (e: any) => {
    setLeadEmail(e.target.value);
  }

  const handleChangeAddLeadPhone = (e: any) => {
    setLeadPhoneNumber(e.target.value);
  }

  const handleChangeAddLeadDescription = (e: any) => {
    setLeadDescription(e.target.value);
  }

  const handleChangeAddLeadTeamEmail = (e: any) => {
    setLeadTeamEmail(e.target.value);
  }

  const onSearchSubmit = async (searchValue: any, searchBy: any, e: any) => {
    e.preventDefault();
    // setInitialTabNavigation('info');
    setSelectedContactId((preSelectedContactId) => null);
    getIfCustomerData(searchValue, searchBy);
    setSelectedTabs(null);
    setLeadDescription('');
    setNoteFormData(initialNoteData);
  }

  // Get the Customer Data without loading
  const getIfCustomerDataNoLoading = async (searchValue: any, searchBy: any) => {
    // var testEmail = 'jeno@dropshiplifestyle.com';
    setNoteFormData(initialNoteData);
    try {
      const response = await axios.get(
        import.meta.env.VITE_APP_API_ENDPOINT + 'search-member-zendesk.php?search_type=' + searchBy + '&search_value=' + searchValue,
        {
          headers: {
            'Content-Type': 'application/json', // Ensure it's sending as JSON
          },
        }
      );

      const { success, contacts, other_contacts, error } = response.data;

      if (success) {
        setContacts(contacts);
      } else {
        if (error != "No contacts found") {
          HelpScout.showNotification(
            NOTIFICATION_TYPES.ERROR,
            "There has been an error getting the customer data, please try again!"
          );
        }
        setContacts([]);
      }
    } catch (err) {
      HelpScout.showNotification(
        NOTIFICATION_TYPES.ERROR,
        "There has been an error getting the customer data, please try again!"
      );
    }
  };

  // Get the Customer Data
  const getIfCustomerData = async (searchValue: any, searchBy: any) => {
    // var testEmail = 'jeno@dropshiplifestyle.com';
    setContacts([]);
    try {
      setIfCustomerLoading(true);
      const response = await axios.get(
        import.meta.env.VITE_APP_API_ENDPOINT + 'search-member-zendesk.php?search_type=' + searchBy + '&search_value=' + searchValue,
        {
          headers: {
            'Content-Type': 'application/json', // Ensure it's sending as JSON
          },
        }
      );

      const { success, contacts, other_contacts, error } = response.data;

      if (success) {
        setContacts(contacts);

        // Initialize selectedTabs for each user to 'info' by default
        const initialTabs: SelectedTabs = {};
        contacts.forEach((user: any) => {
          initialTabs[user.id] = initialTabNavigation; // Default tab for each user
        });
        // setSelectedTabs(initialTabs);
        if (other_contacts) {
          setOtherContacts(other_contacts);
          const initialTabs: SelectedTabs = {};
          other_contacts.forEach((user: any) => {
            initialTabs[user.id] = initialTabNavigation; // Default tab for each user
          });
          // setSelectedOtherTabs(initialTabs);
        }
        setIfCustomerLoading(false);
      } else {
        if (error != "No contacts found") {
          HelpScout.showNotification(
            NOTIFICATION_TYPES.ERROR,
            "There has been an error getting the customer data, please try again!"
          );
        }
        setContacts([]);
        setIfCustomerLoading(false);

      }
    } catch (err) {
      HelpScout.showNotification(
        NOTIFICATION_TYPES.ERROR,
        "There has been an error getting the customer data, please try again!"
      );
      setIfCustomerLoading(false);
    }
    // setInitialTabNavigation('info');
  };

  const addLeadTag = async (tag_id: any, contact_id: any, e: any) => {
    e.preventDefault();
    if (tag_id && contact_id) {
      try {
        setTagLoading((prevLoading) => ({ ...prevLoading, [contact_id]: true }));
        const response = await axios.post(
          import.meta.env.VITE_APP_API_ENDPOINT + 'add-tag-zendesk.php', { tag_id, contact_id }
        );

        const { status, error } = response.data;

        if (status == "SUCCESS") {
          HelpScout.showNotification(
            NOTIFICATION_TYPES.SUCCESS,
            'Tag added successfully'
          );
          getIfCustomerDataNoLoading(searchValue, searchBy);
          setTagLoading((prevLoading) => ({ ...prevLoading, [contact_id]: false }));
        } else {
          HelpScout.showNotification(
            NOTIFICATION_TYPES.ERROR,
            status
          );
          setTagLoading((prevLoading) => ({ ...prevLoading, [contact_id]: false }));
        }
      } catch (err) {
        HelpScout.showNotification(
          NOTIFICATION_TYPES.ERROR,
          "There has been an error adding tag, please try again!"
        );

        //https://zapier.com/editor/191980951/draft/191980951/sample
        const response = await axios.post(
          'https://hooks.zapier.com/hooks/catch/911460/34m0i69/', err
        );

        if (response) {
          console.log(response);
        }

        setTagLoading((prevLoading) => ({ ...prevLoading, [contact_id]: false }));
      }
    } else {
      HelpScout.showNotification(
        NOTIFICATION_TYPES.ERROR,
        'Tag is required'
      );
    }
    setSelectedTag('');
  };

  const addLeadNote = async (contactID: any, e: any) => {
    e.preventDefault();
    setSelectedContactId((prevContactId) => contactID);
    if (noteFormData) {
      let appendedNoteFormData = new FormData();
      appendedNoteFormData.append('contact_id', contactID);
      appendedNoteFormData.append('body', noteFormData.body + ' - ' + adminName);
      appendedNoteFormData.append('type', noteFormData.type);
      appendedNoteFormData.append('title', noteFormData.title);
      try {
        setNoteLoading((prevLoading) => ({ ...prevLoading, [contactID]: true }));
        const response = await axios.post(
          import.meta.env.VITE_APP_API_ENDPOINT + 'add-note-zendesk.php', appendedNoteFormData,
          { headers: { 'content-type': 'multipart/form-data' } }
        );

        const { status, error } = response.data;

        if (status) {
          setInitialTabNavigation('note');
          HelpScout.showNotification(
            NOTIFICATION_TYPES.SUCCESS,
            'Note added successfully'
          );
          getIfCustomerDataNoLoading(searchValue, searchBy);
          setNoteLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
          setSelectedTabs((prevTabs: any) => ({
            ...prevTabs,
            [contactID]: 'note',
          }));

          setSelectedCustomerTabs((prevCustomerTabs: any) => ({
            ...prevCustomerTabs,
            [contactID]: true,
          }));

          setNoteFormData(initialNoteData);
        } else {
          HelpScout.showNotification(
            NOTIFICATION_TYPES.ERROR,
            "There has been an error adding note, please try again!"
          );
          setNoteLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
        }
      } catch (err) {
        HelpScout.showNotification(
          NOTIFICATION_TYPES.ERROR,
          "There has been an error adding note, please try again!"
        );

        setNoteLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
      }
    } else {
      HelpScout.showNotification(
        NOTIFICATION_TYPES.ERROR,
        'Please fill up all fields'
      );
      setNoteLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
    }
    // setInitialTabNavigation('note');
  };

  const addLead = async (contactID: any, e: any) => {
    e.preventDefault();
    // console.log("contactID", contactID);
    const contactByEmail = contacts.find((contact: { id: any; }) => contact.id === contactID);
    setSelectedContactId((prevContactId) => contactID);
    // console.log("contactByEmail", contactByEmail);
    if ((leadEmail != "" && leadTeamEmail != "" && leadDescription != "" && leadEmail != null && leadTeamEmail != null && leadDescription != null) || (contactByEmail.email != "" && contactByEmail.email != null)) {
      let appendedAddLeadFormData = new FormData();
      appendedAddLeadFormData.append('customer_email', leadEmail ?? contactByEmail.email);
      appendedAddLeadFormData.append('phone_number', leadPhoneNumber ?? contactByEmail.phone);
      appendedAddLeadFormData.append('lead_source', leadSource);
      appendedAddLeadFormData.append('hot_lead_radio', leadRadio);
      appendedAddLeadFormData.append('lead_description', leadDescription);
      appendedAddLeadFormData.append('team_email', leadTeamEmail);

      // console.log("addLeadFormData", addLeadFormData);
      let phone;
      let phone_number;
      let digit;
      if (leadPhoneNumber != "" && leadPhoneNumber != null) {
        phone = leadPhoneNumber;
        phone_number = phone.replace(/\D/g, '');
        digit = phone_number.toString()[0];
      } else {
        phone = "";
        phone_number = "";
        digit = "";
      }
      if (phone != "") {
        if (digit) {
          if ((leadEmail != "" && leadDescription != "") || (contactByEmail.email != "" && leadDescription != "")) {
            try {
              setAddLeadLoading((prevLoading) => ({ ...prevLoading, [contactID]: true }));
              //https://zapier.com/editor/173367360/published
              const response = await axios.post(
                'https://hooks.zapier.com/hooks/catch/911460/bptp2y6/', appendedAddLeadFormData,
              );

              const { status, error } = response.data;

              if (status == "success") {
                // https://zapier.com/editor/174158095/published/174158095
                // Failsafe
                const response = await axios.post(
                  'https://hooks.zapier.com/hooks/catch/911460/bpq0tp5/', appendedAddLeadFormData,
                );
                const { status, error } = response.data;
                if (status == "success") {
                  HelpScout.showNotification(
                    NOTIFICATION_TYPES.SUCCESS,
                    'Hot lead added successfully!'
                  );
                }

                setAddLeadLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
                getIfCustomerDataNoLoading(searchValue, searchBy);
                setSelectedTabs((prevTabs: any) => ({
                  ...prevTabs,
                  [contactID]: 'lead',
                }));

                setSelectedCustomerTabs((prevCustomerTabs: any) => ({
                  ...prevCustomerTabs,
                  [contactID]: true,
                }));
                setLeadDescription('');
              } else {
                HelpScout.showNotification(
                  NOTIFICATION_TYPES.ERROR,
                  "There has been an error adding note, please try again!"
                );
                setAddLeadLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
              }
            } catch (err) {
              HelpScout.showNotification(
                NOTIFICATION_TYPES.ERROR,
                "There has been an error adding note, please try again!"
              );

              setAddLeadLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
            }
          } else {
            if (leadEmail == "") {
              HelpScout.showNotification(
                NOTIFICATION_TYPES.ERROR,
                "Please fill up customer email!"
              );
            }

            if (leadDescription == "") {
              HelpScout.showNotification(
                NOTIFICATION_TYPES.ERROR,
                "Please fill up lead description!"
              );
            }
            setAddLeadLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
          }
        } else {
          HelpScout.showNotification(
            NOTIFICATION_TYPES.ERROR,
            "Please enter a valid phone number!"
          );
          setAddLeadLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
        }
      } else {
        if ((leadEmail != "" && leadDescription != "") || (contactByEmail.email != "" && leadDescription != "")) {
          try {
            setAddLeadLoading((prevLoading) => ({ ...prevLoading, [contactID]: true }));
            //https://zapier.com/editor/173367360/published
            const response = await axios.post(
              'https://hooks.zapier.com/hooks/catch/911460/bptp2y6/', appendedAddLeadFormData,
            );

            const { status, error } = response.data;

            if (status == "success") {
              // https://zapier.com/editor/174158095/published/174158095
              // Failsafe
              const response = await axios.post(
                'https://hooks.zapier.com/hooks/catch/911460/bpq0tp5/', appendedAddLeadFormData,
              );
              const { status, error } = response.data;
              if (status == "success") {
                HelpScout.showNotification(
                  NOTIFICATION_TYPES.SUCCESS,
                  'Hot lead added successfully!'
                );
              }
              setAddLeadLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
              getIfCustomerDataNoLoading(searchValue, searchBy);
              setSelectedTabs((prevTabs: any) => ({
                ...prevTabs,
                [contactID]: 'lead',
              }));

              setSelectedCustomerTabs((prevCustomerTabs: any) => ({
                ...prevCustomerTabs,
                [contactID]: true,
              }));
              setLeadDescription('');
            } else {
              HelpScout.showNotification(
                NOTIFICATION_TYPES.ERROR,
                "There has been an error adding note, please try again!"
              );
              setAddLeadLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
            }
          } catch (err) {
            HelpScout.showNotification(
              NOTIFICATION_TYPES.ERROR,
              "There has been an error adding note, please try again!"
            );

            setAddLeadLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
          }
        } else {
          if (leadEmail == "") {
            HelpScout.showNotification(
              NOTIFICATION_TYPES.ERROR,
              "Please fill up customer email!"
            );
          }

          if (leadDescription == "") {
            HelpScout.showNotification(
              NOTIFICATION_TYPES.ERROR,
              "Please fill up lead description!"
            );
          }
          setAddLeadLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
        }
      }
    } else {
      HelpScout.showNotification(
        NOTIFICATION_TYPES.ERROR,
        'Please fill up all fields'
      );
      setAddLeadLoading((prevLoading) => ({ ...prevLoading, [contactID]: false }));
    }
    // setInitialTabNavigation('lead'); 
  };

  // Handle tab change for a specific user
  const handleTabChange = (userId: number, tab: 'info' | 'credits' | 'note' | 'lead' | 'messages') => {
    setSelectedTabs((prevTabs: any) => ({
      ...prevTabs,
      [userId]: tab,
    }));

    setLeadDescription('');
    setNoteFormData(initialNoteData);
  };

  const handleCustomerTabChange = (userId: number, tab: true | false) => {
    setSelectedCustomerTabs((prevCustomerTabs: any) => ({
      ...prevCustomerTabs,
      [userId]: !tab,
    }));

    setSelectedContactId((prevSelectedContactId) => userId);
    setLeadDescription('');
    setNoteFormData(initialNoteData);
  };

  // Handle other tab change for a specific user
  // const handleOtherTabChange = (userId: number, tab: 'info' | 'credits' | 'note' | 'lead') => {
  //   setSelectedOtherTabs((prevTabs: any) => ({
  //     ...prevTabs,
  //     [userId]: tab,
  //   }));
  // };  

  useEffect(() => {
    setUserEmail(user?.email);
    setAdminName(user?.firstName + ' ' + user?.lastName);
    setStatus(conversation?.status);
    setLeadTeamEmail(user?.email);
    if (conversation?.customers) {
      setCustomer(conversation.customers[0]);
      var customerData = conversation.customers[0];
      setCustomerEmail(customerData.emails[0].value);
      setSearchValue(customerData.emails[0].value);
    }

    if (conversation) {
      fetchMessages(conversation.id);
    }
  }, [user, conversation]);

  useEffect(() => {
    if (customer?.emails && customer?.emails.length > 0) {
      var customer_email = customer.emails[0].value;
      getIfCustomerData(customer_email, searchBy);
    }
    var referrer = document.referrer;
    if (referrer.includes("https://secure.helpscout.net")) {
      setIsAllowed(true);
    } else {
      setIsAllowed(false);
    }
  }, [customer]);


  // useEffect(() => {
  //   if (messagesReady) {
  //     postMessages();
  //   }
  // }, [messages, messagesReady]);

  useEffect(() => {
    // Ensure contacts array is not empty
    if (selectedContactId) {
      setSelectedCustomerTabs((prevCustomerTabs: any) => ({
        ...prevCustomerTabs,
        [selectedContactId]: true,
      }));
    } else {
      if (contacts.length > 0) {
        setSelectedCustomerTabs((prevCustomerTabs: any) => ({
          ...prevCustomerTabs,
          [contacts[0].id]: true,
        }));
      }
    }

  }, [contacts]);

  const onClick = () => {
    HelpScout.showNotification(
      NOTIFICATION_TYPES.SUCCESS,
      "Hello from the sidebar app"
    );
  }

  if (!isAllowed) {
    return <div className="App" ref={appRef}>Access Restricted: You cannot access this page directly.</div>;
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
                        <input type="radio" onChange={() => handleSearchTypeChange('email')} className="search-radio" name="search_radio" value="email" checked />Email
                      </label>
                    </>
                    :
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => handleSearchTypeChange('email')} className="search-radio" name="search_radio" value="email" />Email
                      </label>
                    </>
                  }
                </div>
                <div className="col-lg-6">
                  {searchBy == "first_name" ?
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => handleSearchTypeChange('first_name')} className="search-radio" name="search_radio" value="first_name" checked />First Name
                      </label>
                    </>
                    :
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => handleSearchTypeChange('first_name')} className="search-radio" name="search_radio" value="first_name" />First Name
                      </label>
                    </>
                  }
                </div>
                <div className="col-lg-6">
                  {searchBy == "last_name" ?
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => handleSearchTypeChange('last_name')} className="search-radio" name="search_radio" value="last_name" checked />Last Name
                      </label>
                    </>
                    :
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => handleSearchTypeChange('last_name')} className="search-radio" name="search_radio" value="last_name" />Last Name
                      </label>
                    </>
                  }
                </div>
                <div className="col-lg-6">
                  {searchBy == "phone" ?
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => handleSearchTypeChange('phone')} className="search-radio" name="search_radio" value="phone" checked />Phone
                      </label>
                    </>
                    :
                    <>
                      <label className="radio-inline">
                        <input type="radio" onChange={() => handleSearchTypeChange('phone')} className="search-radio" name="search_radio" value="phone" />Phone
                      </label>
                    </>
                  }
                </div>
                <div className="col-lg-12">
                  <form className="form-inline search-form" onSubmit={() => onSearchSubmit(searchValue, searchBy, event)}>
                    <div className="input-group mb-3">
                      <input type="text" className="form-control" id="search_value" placeholder="Search" value={searchValue} onChange={handleSearchChange} />
                      <div className="input-group-append">
                        <button className="btn btn-primary" id="search-contact-submit" type="submit"><FaMagnifyingGlass /></button>
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
                                        <button type="button" onClick={() => handleTabChange(contact.id, 'info')} className={`tablinks contact-info ${(selectedTabs?.[contact.id] && selectedTabs?.[contact.id] === 'info') || !selectedTabs?.[contact.id] ? 'active' : ''}`} data-val={contact.id}>
                                          <i className="fa fa-id-card" style={{ fontSize: '15px' }}></i>
                                        </button>
                                        <button type="button" onClick={() => handleTabChange(contact.id, 'credits')} className={`tablinks contact-coaching ${selectedTabs?.[contact.id] && selectedTabs?.[contact.id] === 'credits' ? 'active' : ''}`} data-val={contact.id}>
                                          <i className="fa fa-users" style={{ fontSize: '15px' }}></i>
                                        </button>
                                        <button type="button" onClick={() => handleTabChange(contact.id, 'note')} className={`tablinks contact-note ${selectedTabs?.[contact.id] && selectedTabs?.[contact.id] === 'note' ? 'active' : ''}`} data-val={contact.id}>
                                          <i className="fa fa-pen" style={{ fontSize: '15px' }}></i>
                                        </button>
                                        {/* <button className="tablinks contact-call" data-val={contact.id}>
                                        <i className="fa fa-phone" style={{fontSize: '20px'}}></i>
                                      </button> */}
                                        <button type="button" onClick={() => handleTabChange(contact.id, 'lead')} className={`tablinks contact-hot-lead ${selectedTabs?.[contact.id] && selectedTabs?.[contact.id] === 'lead' ? 'active' : ''}`} data-val={contact.id}>
                                          <i className="fa fa-plus" style={{ fontSize: '15px' }}></i>
                                        </button>
                                        <button type="button" onClick={function () { handleTabChange(contact.id, 'messages'); postMessages(); }} className={`tablinks contact-hot-lead ${selectedTabs?.[contact.id] && selectedTabs?.[contact.id] === 'messages' ? 'active' : ''}`} data-val={contact.id}>
                                          <i className="fa fa-envelope" style={{ fontSize: '15px' }}></i>
                                        </button>
                                      </div>
                                    </div>
                                    <div className="tab-contents pt-3 pe-3 ps-3 pb-2">
                                      <div className={`tab-content contact-info-content ${(selectedTabs?.[contact.id] && selectedTabs?.[contact.id] === 'info') || !selectedTabs?.[contact.id] ? 'active' : ''}`}>
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
                                                <form onSubmit={() => addLeadTag(selectedTag, contact?.id, event)}>
                                                  <div className="input-group mb-3">
                                                    <select name="tags_selection" className="form-control select-tag" id={`tag-select-${contact.id}`} onChange={handleTagChange}>
                                                      <option hidden selected value="">Select a tag</option>
                                                      {add_tags.map((add_tag: any) => (
                                                        <option value={add_tag.id}>{add_tag.name}</option>
                                                      ))}
                                                    </select>
                                                    <button
                                                      className="btn add-tag-btn"
                                                      data-val={contact.id}
                                                      key={contact.id}
                                                      type="submit"
                                                      disabled={!!tagLoading[contact.id]}
                                                    >
                                                      {tagLoading[contact.id] ? "Adding..." : "Add"}
                                                    </button>

                                                  </div>
                                                </form>

                                                {/* <p id="tag-error">Please select a tag!</p> */}
                                              </div>
                                            }
                                          </div>
                                        </div>
                                      </div>
                                      <div className={`tab-content contact-coaching-content ${selectedTabs?.[contact.id] && selectedTabs?.[contact.id] === 'credits' ? 'active' : ''}`}>
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
                                      <div className={`tab-content contact-note-content ${selectedTabs?.[contact.id] && selectedTabs?.[contact.id] === 'note' ? 'active' : ''}`}>
                                        <div className="row">
                                          <div className="col-lg-12">
                                            <form onSubmit={() => addLeadNote(contact.id, event)}>
                                              <h6 className="tags-header mb-2 mt-0">Add Note</h6>
                                              <input type="text" placeholder="Title" className="form-control mb-3" value={noteFormData.title} id={`note-title-${contact.id}`} name="title" onChange={handleChangeNote} />
                                              <textarea placeholder="Note" className="form-control" value={noteFormData.body} id={`note-${contact.id}`} rows={3} name="body" onChange={handleChangeNote}></textarea>
                                              <button
                                                className="btn add-note-btn btn-primary w-100 mt-3"
                                                data-val={contact.id}
                                                key={contact.id}
                                                type="submit"
                                                disabled={!!noteLoading[contact.id]}
                                              >
                                                {noteLoading[contact.id] ? "Adding..." : "Add"}
                                              </button>
                                            </form>
                                            {notes && notes.length > 0 ?
                                              <>
                                                <h6 className="tags-header mb-2 mt-3">Notes</h6>
                                                {notes.map((note: any) => (
                                                  <>
                                                    <div className="card mb-3 note-card" onClick={() => setActiveNoteId((prevNoteId) => prevNoteId == note.id ? '' : note.id)}>
                                                      <div className="card-header p-2 fs-12">
                                                        {note.title}({note.type}) - {note.date_created} <i className={`fa fa-chevron-down ${activeNoteId == note.id ? 'active' : ''}`}></i>
                                                      </div>
                                                      <div className={`card-body p-2 ${activeNoteId == note.id ? 'active' : ''}`}>
                                                        {note.body ?
                                                          note.body
                                                          : note.text ?
                                                            note.text
                                                            :
                                                            null
                                                        }
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
                                      <div className={`tab-content contact-hot-lead-content ${selectedTabs?.[contact.id] && selectedTabs?.[contact.id] === 'lead' ? 'active' : ''}`}>
                                        <div className="row">
                                          <div className="col-lg-12">
                                            <h6 className="tags-header mb-2 mt-0">Add Lead</h6>
                                            <form id="add-hot-lead-form" onSubmit={() => addLead(contact.id, event)}>
                                              <input type="email" placeholder="Customer Email" className="form-control mb-3" id="hot-lead-email" name="customer_email" defaultValue={contact?.email} onChange={handleChangeAddLeadEmail} />
                                              <input type="tel" placeholder="Customer Phone" className="form-control mb-3" id="hot-lead-phone" name="phone_number" defaultValue={contact?.phone} onChange={handleChangeAddLeadPhone} />
                                              <textarea placeholder="Notes" className="form-control mb-3" id="hot-lead-notes" rows={3} name="lead_description" value={leadDescription} onChange={handleChangeAddLeadDescription}></textarea>
                                              <input type="email" placeholder="Agent Email" className="form-control mb-3" name="team_email" id="hot-lead-team-email" defaultValue={userEmail} onChange={handleChangeAddLeadTeamEmail} />
                                              {/* <p id="lead-error">Please fill up all fields!</p>
                                              <p id="lead-success">Lead added successfully!</p> */}
                                              <button
                                                className="btn add-lead-btn btn-primary w-100 mt-3"
                                                data-val={contact.id}
                                                key={contact.id}
                                                type="submit"
                                                disabled={!!addLeadLoading[contact.id]}
                                              >
                                                {addLeadLoading[contact.id] ? "Adding..." : "Add"}
                                              </button>
                                            </form>
                                          </div>
                                        </div>
                                      </div>

                                      <div className={`tab-content contact-messages-content ${selectedTabs?.[contact.id] && selectedTabs?.[contact.id] === 'messages' ? 'active' : ''}`}>
                                        <div className="row">
                                          <div className="col-lg-12">
                                            <div className="d-flex justify-content-between">
                                              <h6 className="tags-header mb-2 mt-0">Messages</h6>
                                              {messagesLoading ?
                                                null
                                                :
                                                <>
                                                  {messageResponse ?
                                                    <>
                                                      {messageResponse.length > 0 ?
                                                        <button className="btn btn-primary copy-btn" onClick={() => copyToClipboard(event, messageResponse)}><i className="fa-solid fa-copy" style={{fontSize:'12px', marginBottom:'5px'}}></i></button>
                                                        :
                                                        null
                                                      }
                                                    </>
                                                    :
                                                    null

                                                  }
                                                </>
                                              }

                                            </div>

                                            <div className="messages-container">
                                              <div className="row">
                                                {messagesLoading ?
                                                  <div id="loading-gif">
                                                    <img src={LoadingImg} />
                                                  </div>
                                                  :
                                                  <>
                                                    {messageResponse && messageResponse.length > 0 ?
                                                      <>
                                                            <div className="message-container mb-3 active col-lg-12">
                                                              <textarea id="custom_code" ref={textAreaRef} style={{ display: 'none' }} defaultValue={messageResponse}></textarea>
                                                              <div className="card">
                                                                <div className="card-body">
                                                                  {/* <textarea disabled readOnly={true}>{messageResponse}</textarea> */}
                                                                  <pre style={{ whiteSpace: "pre-wrap", fontFamily:'Montserrat, sans-serif' }}>{messageResponse}</pre>
                                                                </div>
                                                              </div>

                                                            </div>
                                                      </>
                                                      :
                                                      <>
                                                        <textarea id="custom_code" ref={textAreaRef} style={{ display: 'none' }} defaultValue={messageResponse}></textarea>
                                                        <p className="mb-0">No records found.</p>
                                                      </>
                                                    }
                                                  </>
                                                }
                                              </div>
                                            </div>
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
