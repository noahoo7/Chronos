/** FOR THE NEXT TEAM
 * Currently, data for multiple servers overlap, as we wanted. However, if using the dummy MongoDB data, the lines technically do not overlap since it only records speeds for one server at a time. However, we expect that, when running on a proper app, speeds from all servers will be recorded.
 */

import React, { useContext, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import moment from 'moment';
import { HealthContext } from '../context/HealthContext';
import { all, solo as soloStyle } from './sizeSwitch';

interface GraphsContainerProps {
  sizing: string;
}
interface SoloStyles {
  height: number;
  width: number;
}

const SpeedChart: React.FC<GraphsContainerProps> = React.memo(({ sizing }) => {
  const { healthData } = useContext(HealthContext);
  const [data, setData] = useState<Array<Array<Array<string | number> | string>>>([]);

  useEffect(() => {
    if (healthData.length) {
      const tempArr: ((string | number)[] | string)[][] = [];
      // loop over each
      healthData.forEach(
        (service: { time: string[]; cpuspeed: (string | number)[]; service: string[] }) => {
          let timeArr: string[] = [];
          // perform this when we 'setTime'
          if (service.time !== undefined) {
            timeArr = service.time.map((el: any) => moment(el).format('kk:mm:ss'));
          }

          const temp: [string[], (string | number)[], string] = [
            timeArr,
            service.cpuspeed,
            service.service[0],
          ];
          tempArr.push(temp);
        }
      );
      setData(tempArr);
    }
  }, [healthData]);

  // useEffect(() => {
  //   console.log(data);
  // }, [data]);

  const [solo, setSolo] = useState<SoloStyles | null>(null);

  setInterval(() => {
    if (solo !== soloStyle) {
      setSolo(soloStyle);
    }
  }, 20);

  const createChart = () => {
    let plotlyData: {
      name: any;
      x: any;
      y: any;
      type: any;
      mode: any;
      marker: { color: string };
    }[] = [];

    plotlyData = data.map(dataArr => {
      // eslint-disable-next-line no-bitwise
      const randomColor = `#${(((1 << 24) * Math.random()) | 0).toString(16)}`;
      return {
        name: dataArr[2],
        x: data[0][0],
        y: dataArr[1],
        type: 'scatter',
        mode: 'lines',
        marker: {
          color: randomColor,
        },
      };
    });

    const sizeSwitch = sizing === 'all' ? all : solo;

    return (
      <Plot
        data={[...plotlyData]}
        config={{ displayModeBar: false }}
        layout={{
          title: 'Speed Chart',
          ...sizeSwitch,
          font: {
            color: '#444d56',
            size: 11.5,
            family: 'Roboto',
          },
          xaxis: {
            title: 'Time (EST)',
            tickmode: 'auto',
            dtick: 2,
            tickformat: '%H %M %p',
            // tickangle: 30,
            // range: [0, 5],
            rangemode: 'nonnegative',
            mirror: false,
            ticks: 'outside',
            showline: true,
          },
          yaxis: {
            title: 'Data Rates (MBPS)',
            mirror: false,
            ticks: 'outside',
            showline: true,
          },
          paper_bgcolor: 'white',
          showlegend: true,
          legend: {
            orientation: 'h',
            xanchor: 'auto',
            x: 0.5,
            y: 5,
          },
        }}
      />
    );
  };

  return <div className="chart">{solo && createChart()}</div>;
});

export default SpeedChart;
