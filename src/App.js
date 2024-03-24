import './App.css';
import Chart from "react-apexcharts";
import React, { useState, useEffect } from "react";
import axios from 'axios';

function App() {

  const [csvData, setCsvData] = useState({
     highRiskData :[],
     mediumRiskData :[],
     lowRiskData :[],
     monthData :[]
  });


  console.log('csvdata', csvData)

  const data = {
          
    series: [
      
      {
        name: "High Risk",
        // data: [-10, 41, 35, 51, 49, 62, 69, 91, 148,11,32,52],
        data: csvData.highRiskData,
      },
      {
        name: "Medium Risk",
        data: csvData.mediumRiskData,

      },
      {
        name: "Low Risk",
        data: csvData.lowRiskData,

      },
  
  ],
    options: {
      yaxis: {
        labels: {
          formatter: function (value) {
            return value + "%";
          }
        },
      },
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      colors: ["rgb(255, 0, 0)", "rgb(255, 143, 0)","rgb(93, 162, 17)"],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width:'3'
      },
      xaxis: {
        categories: csvData.monthData
      }
    },
  
  
  };

  useEffect(() => {
    fetchCSVData();
  }, []);
  function parseCSV(csvText) {
    const rows = csvText.split(/\r?\n/);       
    const headers = rows[0].split(',');        
    const data = [];        
    for (let i = 1; i < rows.length; i++) {
        const rowData = rows[i].split(',');          
        const rowObject = {};
        for (let j = 0; j < headers.length; j++) {
            rowObject[headers[j]] = rowData[j];
        }
        data.push(rowObject);
    }
    return data;
}

  const fetchCSVData = () => {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQEx9VUaHfPCFHbcfoypTWoTYqB9sevJobBdc6QX5piKXP3aHOhH9b_EERJZwDh79m6i2dUqBPYItqY/pub?output=csv'; // Replace with your Google Sheets CSV file URL

    axios.get(csvUrl)
            .then((response) => {
                const parsedCsvData = parseCSV(response.data);

                let modified = calculateAverageRisk(parsedCsvData)
                console.log('modified', modified);
                // setCsvData(parsedCsvData);
                let highRiskData = [];
                let mediumRiskData = [];
                let lowRiskData = [];
                let monthData = [];

                modified.forEach(entry => {
                  highRiskData.push(parseFloat(entry['High Risk']));
                  mediumRiskData.push(parseFloat(entry['Medium Risk']));
                  lowRiskData.push(parseFloat(entry['Low Risk']));
                  monthData.push(entry['Date']);
                });

                setCsvData({
                  highRiskData :highRiskData,
                  mediumRiskData :mediumRiskData,
                  lowRiskData :lowRiskData,
                  monthData :monthData
               })

            })
            .catch((error) => {
                console.error('Error fetching CSV data:', error);
            });
    }

    function calculateAverageRisk(data) {
      const monthData = {};
  
      // Aggregate data by month
      data.forEach(entry => {
          const [month,date, year] = entry.Date.split('/');

          console.log('month', month, year)
          const key = `${month}/${year}`;

          const highRisk = parseFloat(entry['High Risk']);
          const mediumRisk = parseFloat(entry['Medium Risk']);
          const lowRisk = parseFloat(entry['Low Risk']);
  
          if (!monthData[key]) {
              monthData[key] = { count: 0, totalHigh: 0, totalMedium: 0, totalLow: 0 };
          }
  
          monthData[key].count++;
          monthData[key].totalHigh += highRisk;
          monthData[key].totalMedium += mediumRisk;
          monthData[key].totalLow += lowRisk;
      });
  
      // Calculate averages
      const averagedData = Object.keys(monthData).map(key => {
          const { count, totalHigh, totalMedium, totalLow } = monthData[key];
          return {
              Date: key,
              'High Risk': (totalHigh / count).toFixed(2),
              'Medium Risk': (totalMedium / count).toFixed(2),
              'Low Risk': (totalLow / count).toFixed(2)
          };
      });
  
      return averagedData;
  } 

  return (
    <div className='dm-sans-font'>
      <div className='header'>Live Performace</div>
      <Chart
              options={data.options}
              series={data.series}
              type="line"
              width="700"
            />
    </div>
  );
}

export default App;
