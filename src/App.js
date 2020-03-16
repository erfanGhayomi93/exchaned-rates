import React, { useState, useRef } from "react";
import axios from "axios";
import loading from "./loading.gif";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [data, setData] = useState({});
  const [loadingState, setLoadingState] = useState(false);

  const fromCurrencyRef = useRef("");
  const toCurrencyRef = useRef("");
  const amountRef = useRef(0);

  const getExchangeRate = async (fromCurrency, toCurrency) => {
    try {
      const response = await axios({
        url : "http://data.fixer.io/api/latest?access_key=c23c0bb4738a0973cb3e368e75190c2b&format=1",
        method : "GET"     
      })
      const rate = response.data.rates;
      const euro = 1 / rate[fromCurrency]; //    1 / irr  or  1 / 46923
      const exchangeRate = euro * rate[toCurrency]; // mabda * maghsad
      return exchangeRate;
    } catch (error) {
      setLoadingState(true)
      throw new Error(
        `Unable to get currency ${fromCurrency} and  ${toCurrency}`
      );
    }
  };

  const getCountries = async currencyCode => {
    try {
      const response = await axios.get(
        `https://restcountries.eu/rest/v2/currency/${currencyCode}`
      );
      return response.data.map(country => ({
        name: country.name,
        population: country.population,
        image: country.flag,
        namePersian: country.translations.fa,
        currencies: country.currencies[0].name
      }));
    } catch (error) {
      throw new Error(`واحد پول مقصد را اشتباه وارد کرده اید-${currencyCode}, ${error}`);
    }
  };

  const convertCurrency = async (fromCurrency, toCurrency, amount) => {
    const exchangeRate = await getExchangeRate(fromCurrency, toCurrency);
    const countries = await getCountries(toCurrency);
    const convertedAmount = (amount * exchangeRate).toFixed(2);

    if(isNaN(exchangeRate)){
      alert("واحد پول مبدا را اشتباه وارد کردید");
      setData({})
      return
    }
      

    setData({ fromCurrency, toCurrency, amount, convertedAmount, countries });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setLoadingState(true);

    const fromCurrencyArg = fromCurrencyRef.current.value;
    const toCurrencyArg = toCurrencyRef.current.value;
    const amountArg = parseInt(amountRef.current.value);

    convertCurrency(fromCurrencyArg, toCurrencyArg, amountArg)
      .then(res => setLoadingState(false))
      .catch(error => {
        setLoadingState(false);
        alert(error.message);
      });
  };

  return (
    <div dir="rtl">
      <div className="form" onSubmit={handleSubmit}>
        <form>
          <input
            type="number"
            className="form-control pr-2 mt-2"
            placeholder="مقدار پول"
            ref={amountRef}
            required
          />
          <input
            className="form-control pr-2 mt-2"
            placeholder="ارز مبدا را وارد کنید"
            ref={fromCurrencyRef}
            required
          />
          <input
            className="form-control pr-2 mt-2"
            placeholder="ارز مقصد را وارد کنید"
            ref={toCurrencyRef}
            required
          />
          <button className="btn-primary btn-block p-2 mt-2">ثبت</button>
        </form>
      </div>

      {Object.keys(data).length !== 0 && !loadingState ? (
        <div className="text-center mt-5">
          <p>
            {data.amount} {data.fromCurrency} در جهان {data.convertedAmount}{" "}
            {data.toCurrency} میباشد.
          </p>

          <p>
            {" "}
            واحد پول {data.countries[0].currencies} می توانید در کشورهای زیر
            استفاده کنید
          </p>

          {data.countries.map((country, index) => (
            <div className="countres" key={index}>
              <div className="item">
                <img src={country.image} alt="" />
              </div>
              <div className="item">
                <p>
                  نام : {country.name} - {country.namePersian}
                </p>
                <p>{country.population} نفر</p>
                <p>{country.currencies}</p>
              </div>
            </div>
          ))}
        </div>
      ) : loadingState === true ? (
        <div className="images text-center mt-5">
          <img src={loading} alt="" />
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default App;