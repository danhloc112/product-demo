import './App.css';
import '@shopify/polaris/dist/styles.css';
import {Card, DataTable, Page} from '@shopify/polaris';
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react';
let sinceId = 0;
const limit = 10;
const params = "id,vendor,title,product_type,variants,tags"
const url = 'https://loc.omegatheme.com/sample-app/admin/services.php'
function App() {
  const [listProduct,setListProduct] = useState([]);
  const [listDetail,setListDetail] = useState([]);
  const [showDetail,setShowDetail] = useState(false);
  const [sortedRows,setSortedRows] = useState([]);


  useEffect(() => {
    axios.get(`${url}?shop=tran-danh-loc.myshopify.com&action=getProduct&limit=${limit}&since_id=${sinceId}&params=${params}`)
      .then(res => setListProduct([...res.data]))
      .catch(error => console.log(error)  )
  },[])
  let initialRows = []
    listProduct.forEach(product => {
    initialRows.push([
      <p className="product_title" onClick={() => {
        setShowDetail(true)
        setListDetail([...product.variants])
      }}>{product.title}</p>,
      product.vendor,
      product.product_type,
      product.tags
    ])
    })
  let detailList = listDetail.map(item => {
    return [
      item.title,
      item.price,
      `${item.weight} ${item.weight_unit}`
    ]
  })
  console.log("initialRows", showDetail);
  const rows = sortedRows.length ? sortedRows : initialRows;
  const handleSort = useCallback((index,direction) => setSortedRows(sortArray(rows,index,direction)),[rows]) 
  return (
    <div className="App">
        <Page title="Product List">
      <Card>
        <DataTable
          columnContentTypes={[
            'text',
            'text',
            'text',
            'text',
          ]}
          headings={[
            'Title',
            'Vendor',
            'Product type',
            'Tags',
          ]}
          rows={rows}
          sortable={[false, true, true, true]}
          defaultSortDirection="descending"
          initialSortColumnIndex={4}
          onSort={handleSort}
        />
      </Card>
      </Page>
      
      {
        showDetail &&
        <Page title="Product Detail">
          <Card>
            <DataTable
              columnContentTypes={[
                'text',
                'text',
                'text',
              ]}
              headings={[
                'Title',
                'Price',
                'Weight',
              ]}
              rows={detailList}
            />
          </Card>
        </Page>
      }
    </div>
  );
  function sortArray(rows,index,direction) {
    let temp = [];
    [...rows].forEach(row => {
      temp.push(row[index])
      // console.log("row",row[index]);
    })
    console.log("rows",temp.sort().reverse());
    return []
  }
}

export default App;
