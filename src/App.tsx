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
import './bootstrap.min.css';
import { FaMagnifyingGlass } from "react-icons/fa6";

function App() {
  const appRef = useSetAppHeight();

  const [userEmail, setUserEmail] = useState<string | undefined>(
    "unknown user"
  );
  const [customer, setCustomer] = useState(null);
  const [status, setStatus] = useState<string | undefined>("unknown status");
  const [searchBy, setSearchBy] = useState('email');
  const [customerEmail, setCustomerEmail] = useState('');
  const { user, conversation } = useHelpScoutContext();

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
    console.log(customer);
  }, [customer]);

  function onClick() {
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
                <div className="col-lg-6 mb-1">
                  {searchBy == "email" ?
                    <>
                      <label className="radio-inline">
                        <input type="radio" onClick={() => setSearchBy('email')} className="search-radio" name="search_radio" value="email" checked />Email
                      </label>
                    </>
                    :
                    <>
                      <label className="radio-inline">
                        <input type="radio" onClick={() => setSearchBy('email')} className="search-radio" name="search_radio" value="email" />Email
                      </label>
                    </>
                  }
                </div>
                <div className="col-lg-6 mb-1">
                  {searchBy == "first_name" ?
                    <>
                      <label className="radio-inline">
                        <input type="radio" onClick={() => setSearchBy('first_name')} className="search-radio" name="search_radio" value="first_name" checked />First Name
                      </label>
                    </>
                    :
                    <>
                      <label className="radio-inline">
                        <input type="radio" onClick={() => setSearchBy('first_name')} className="search-radio" name="search_radio" value="first_name" />First Name
                      </label>
                    </>
                  }
                </div>
                <div className="col-lg-6 mb-1">
                  {searchBy == "last_name" ?
                    <>
                      <label className="radio-inline">
                        <input type="radio" onClick={() => setSearchBy('last_name')} className="search-radio" name="search_radio" value="last_name" checked />Last Name
                      </label>
                    </>
                    :
                    <>
                      <label className="radio-inline">
                        <input type="radio" onClick={() => setSearchBy('last_name')} className="search-radio" name="search_radio" value="last_name" />Last Name
                      </label>
                    </>
                  }
                </div>
                <div className="col-lg-6 mb-1">
                  {searchBy == "phone" ?
                    <>
                      <label className="radio-inline">
                        <input type="radio" onClick={() => setSearchBy('phone')} className="search-radio" name="search_radio" value="phone" checked />Phone
                      </label>
                    </>
                    :
                    <>
                      <label className="radio-inline">
                        <input type="radio" onClick={() => setSearchBy('phone')} className="search-radio" name="search_radio" value="phone" />Phone
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
