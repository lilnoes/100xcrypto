import Head from "next/head";
import React from "react";
import useSWR from "swr";
const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { assets: [] };
    this.last = 0;
    this.limit = 10;
  }

  async handleClick() {
    const res = await getAssets(this.last, this.limit);
    const assets = this.state.assets.slice();
    assets.push(...res.assets);
    this.last = assets.length;
    console.log(assets);
    this.setState({ assets: assets });
  }

  render() {
    const assets = this.state.assets.map((asset) => <Asset asset={asset} key={asset.name} />);
    console.log("assets lengtth", assets);
    return (
      <>
        <div className="bg-red-100 p-3">
          <h1 className="text-2xl font-bold mb-3">Assets</h1>
          <div className="mb-5">{assets}</div>
          <button className="p-2 text-white bg-blue-800 rounded-lg" onClick={()=>this.handleClick()}>Load 10 more</button>
        </div>
      </>
    );
  }
}

function Asset(props) {
  console.log("here here");
  const asset = props.asset;
  if(!asset.urls) return <div></div>
  return (<>
    <div className="bg-white rounded-lg p-1 my-3">
      <h2 className="text-xl font-bold">{asset.name}</h2>
      {/* <div><img src={asset.logo} /></div> */}
      <p><span className="key">symbol: </span>{asset.symbol}</p>
      <p><span className="key">date added: </span>{asset.date_added}</p>
      <p><span className="key">platform: </span>{asset.platform.name}</p>
      <p><span className="key">volume(24h): </span>{asset.volume_24h}</p>
      <p><span className="key">market cap: </span>{asset.market_cap}</p>
      <p><span className="key">holders: </span>{asset.holders}</p>
      <p><span className="key">transfers: </span>{asset.transfers}</p>
      <p><span className="key">description: </span>{asset.description}</p>
      <p><span className="key">website: </span><a href={asset.urls.website[0]}>{asset.urls.website[0]}</a></p>
      <p><span className="key">explorer: </span><a href={asset.urls.explorer[0]}>{asset.urls.explorer[0]}</a></p>
      <p><span className="key">twitter: </span><a href={asset.urls.twitter[0]}>{asset.urls.twitter[0]}</a></p>
    </div>
  </>);
}

async function getAssets(last, limit) {
  const resp = await fetch("/api/assets", {
    headers: {
      'Accept': 'Application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ last: last, limit: limit }),
    method: "post",
  });
  const res = await resp.json();
  console.log(res);
  return res;
}
