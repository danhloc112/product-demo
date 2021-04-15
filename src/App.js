import './App.css';
import '@shopify/polaris/dist/styles.css';
import {Card, DataTable, Page, ChoiceList, Filters, TextField, Button, Pagination, Checkbox} from '@shopify/polaris';
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react';
let sinceId = 0;
// let count = 250;
const nextLimit = 20;
let id = 0;
const limit = 250;
const params = "id,vendor,title,product_type,variants,tags"
const url = 'https://loc.omegatheme.com/sample-app/admin/services.php'
function App() {
  const [listProduct,setListProduct] = useState([]);
  const [listDetail,setListDetail] = useState([]);
  const [showDetail,setShowDetail] = useState(false);
  const [sortedRows,setSortedRows] = useState([]);
  const [vendor,setVendorData] = useState(null);
  const [type,setType] = useState(null);
  const [tags,setTags] = useState(null);
  const [sort,setSort] = useState(null);
  const [prev,setPrev] = useState(false);
  const [next,setNext] = useState(true);
  const [count,setCount] = useState(0);
  
  const [checked,setChecked] = useState([]);
  const [checkAll,setCheckAll] = useState(false);
  const [queryValue,setQueryValue] = useState(null);
  const [tempArr,setTempArr] = useState([])
  const [pagiArr, setPagiArr] = useState([])
  const [showFilterVendor,setShowFilterVendor] = useState(false);
  const appliedFilters = [];
  // const checkList = []

  useEffect(() => {
    // axios.get(`${url}?shop=tran-danh-loc.myshopify.com&action=count`)
    //   .then(res => console.log("count", res))
    //   .catch(error => console.log("Error: ", error))
    axios.get(`${url}?shop=tran-danh-loc.myshopify.com&action=getProduct&limit=${limit}&since_id=${sinceId}&params=${params}`)
      .then(res => {
        setPagiArr([...res.data])
      })
      .catch(error => console.log(error))
    
    axios.get(`${url}?shop=tran-danh-loc.myshopify.com&action=getProduct&limit=${nextLimit}&since_id=${sinceId}&params=${params}`)
      .then(res => {
        setPagiArr([...res.data])
        setTempArr([...res.data])
        setListProduct([...res.data])
        const temp = []
          res.data.forEach(ele => {
             temp.push({checked: false})  
          })
        // console.log("temp", temp);
        
        setChecked([...temp])
      })
      .catch(error => console.log(error)  )
  },[])

  // Method check
  const handleCheckChange = (value,id,index) => {
    const temp = [...checked];
    temp[index] = { checked: value }
    const countTemp = temp.filter(ele => {
      return ele.checked === true
    }).length
    setCount(countTemp)
    setChecked([...temp])
    if (value === true) {
      setCheckAll('indeterminate')
    }
    else {
      setCheckAll(false)
    }
    if (countTemp > 0) {
      setCheckAll('indeterminate')
    }
    else {
      setCheckAll(false)
      
    }
    
  }

  const handleCheckAll = () => {
    if (checkAll === 'indeterminate') {
      setCheckAll(true)
      const temp = []
        checked.forEach(ele => {
          temp.push({checked: true})
        })
        setCount(temp.filter(ele => {
          return ele.checked === true
        }).length)
      setChecked([...temp]) 
    }
    else {
      setCheckAll(!checkAll)
      // console.log("checked", checked);
      const temp = []
        checked.forEach(ele => {
          
        temp.push({checked: !checkAll})
        })
        setCount(temp.filter(ele => {
          return ele.checked === true
        }).length)
      setChecked([...temp]) 
    }
  }

  let initialRows = []
    listProduct.forEach((product,index) => {
      initialRows.push([
        <Checkbox
          label="check"
          labelHidden={true}
          id={product.id}
          checked={checked.length ? checked[index].checked : false}
          onChange={(value,id) => handleCheckChange(value,id,index)}
      />,
      <p className="product_title" onClick={() => {
        setShowDetail(true)
        setListDetail([...product.variants])
      }}>{product.title}</p>,
      product.vendor,
      product.product_type,
        product.tags,
      <button className="btn_approve"> Approve</button>
    ])
    })
  let detailList = listDetail.map(item => {
    return [
      item.title,
      item.price,
      `${item.weight} ${item.weight_unit}`
    ]
  })

  
  // console.log("initialRows", showDetail);
  const rows = sortedRows.length ? sortedRows : initialRows;
  const handleSort = useCallback((index,direction) => {
    setSortedRows(sortArray(rows,index,direction))
    // console.log("object", sortArray(rows,index,direction));
  },[rows]);
  
  // Pagination method
  const handlePrev = () => {
    removeAll()
    // console.log("sinceId", sinceId);
    id -= nextLimit
    if (id <= 0) {
      setPrev(false)
    }
    else {
      setPrev(true)
    }
    if (id <= 0) {
      sinceId = 0
    }
    else {
      sinceId = pagiArr[id].id

    }
    axios.get(`${url}?shop=tran-danh-loc.myshopify.com&action=getProduct&limit=${nextLimit}&since_id=${sinceId}&params=${params}`)
    .then(res => {
      setTempArr([...res.data])
      setListProduct([...res.data])
    })
    .catch(error => console.log(error)  )
  }

  const handleNext = () => {
    removeAll()
    id += nextLimit
    if (id > 5005) {
      setNext(false)
    }
    // console.log("sinceId", sinceId);
    setPrev(true)
      sinceId = pagiArr[id].id
      
    axios.get(`${url}?shop=tran-danh-loc.myshopify.com&action=getProduct&limit=${nextLimit}&since_id=${sinceId}&params=${params}`)
    .then(res => {
      setTempArr([...res.data])
      setListProduct([...res.data])
    })
    .catch(error => console.log(error)  )
  }



  // Method change filter

  

  const debouncedKeyUp = debounce((value) => {
    if (value === '') {
      setListProduct(tempArr)
    }
    else {
      const temp = tempArr.filter(item => {
        return item.title.toLowerCase().includes(value.toLowerCase())
      })
      setListProduct([...temp])
    }
    }, 300);
  const handleFiltersQueryChange = (value) => {
    setQueryValue(value)
    debouncedKeyUp(value)
    
  }

  const handleVendorChange = (value) => {
    setVendorData(value)
    console.log("object",value);
    if (!value.length) {
      setListProduct([...tempArr])
    }
    else {
      const temp = tempArr.filter(item => {
        // console.log("object", item.vendor);
        return value.includes(item.vendor)
      })
      setListProduct([...temp])
    }
  }

  const handleTypeChange = (value) => {
    setType(value)
    // console.log("object",value);
    if (!value.length) {
      setListProduct([...tempArr])
    }
    else {
      const temp = tempArr.filter(item => {
        // console.log("object", item.vendor);
        return value.includes(item.product_type)
      })
      setListProduct([...temp])
    }
  }


  const handleFiltersTagsChange = (value) => {
    setTags(value)
    // console.log("object",value);
    if (!value.length) {
      setListProduct([...tempArr])
    }
    else {
      const temp = tempArr.filter(item => {
        // console.log("object", item.vendor);
        return item.tags.toLowerCase().includes(value.toLowerCase())
      })
      setListProduct([...temp])
    }
  }
  
  //Method remove filter
  const handleTagsRemove = () => {
    setListProduct([...tempArr])
    // setShowFilterVendor(!showFilterVendor)
    setTags([])
  }

  const handleVendorClear = () => {
    setListProduct([...tempArr])
    setShowFilterVendor(!showFilterVendor)
    setVendorData([])
  }

  const handleTypeClear = () => {
    setListProduct([...tempArr])
    // setShowFilterVendor(!showFilterVendor)
    setType([])
  }
  
  const handleTagsClear = () => {
    setListProduct([...tempArr])
    // setShowFilterVendor(!showFilterVendor)
    setTags([])
  }

  const handleSortClear = () => {
    setListProduct([...tempArr])
    // setShowFilterVendor(!showFilterVendor)
    setSort([])
  }
  
  const handleQueryValueRemove = () => {
    setQueryValue([]);
    setListProduct(tempArr)
  }

  // Remove all filter 
  const removeAll = () => {
    setQueryValue([]);
    setTags([]);
    setType([]);
    setVendorData([]);
  }

  //Sort method

  // const handleSortChange = (value) => {
    
  //   switch (value.join('')) {
  //     case "Title (A-Z)":
  //       setListProduct(sortArray(rows,0,'ascending'));
  //       break;
  //     case "Title (Z-A)":
  //       setListProduct(sortArray(rows,0,'descending'));
  //       break;
  //     case "Vendor (A-Z)":
  //       // console.log("object", rows);
  //       setListProduct(sortArray(rows,1,'ascending'));
  //       break;
  //     case "Vendor (Z-A)":
  //       setListProduct(sortArray(rows,1,'descending'));
  //       break;
  //     case "Product Type (A-Z)":
  //       setListProduct(sortArray(rows,2,'ascending'));
  //       break;
  //     case "Product Type (Z-A)":
  //       setListProduct(sortArray(rows,2,'descending'));
  //       break;
  //     default:
  //       setListProduct(tempArr);
  //       break;
  //   }
  //   setSort(value)
  // }
  
  // Filters field
  const filters = [
    {
      key: 'vendor',
      label: 'Vendor',
      filter: (
        <ChoiceList
          title="Vendor"
          titleHidden
          choices={[
            {label: 'Affinity', value: 'Affinity'},
            {label: 'Acana', value: 'Acana'},
            { label: 'Wolfsblut',value: 'Wolfsblut' },
            {label: 'tran danh loc', value: 'tran danh loc'},
            
          ]}
          selected={vendor || []}
          onChange={handleVendorChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'type',
      label: 'Product Type',
      filter: (
        <ChoiceList
          title="Type"
          titleHidden
          choices={[
            {label: 'Canned cat food', value: 'Canned cat food'},
            {label: 'Dog food', value: 'Dog food'},
            
          ]}
          selected={type || []}
          onChange={handleTypeChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'tags',
      label: 'Tags',
      filter: (
        <TextField
          placeholder="Tags with"
          value={tags}
          onChange={handleFiltersTagsChange}
          clearButton
          onClearButtonClick={handleTagsRemove}
        />
      ),
      shortcut: true,
    },
    // {
    //   key: 'sort',
    //   label: 'Sort',
    //   filter: (
    //     <ChoiceList
    //       title="Type"
    //       titleHidden
    //       choices={[
    //         {label: 'Title (A-Z)', value: 'Title (A-Z)'},
    //         { label: 'Title (Z-A)',value: 'Title (Z-A)' },
    //         {label: 'Vendor (A-Z)', value: 'Vendor (A-Z)'},
    //         { label: 'Vendor (Z-A)',value: 'Vendor (Z-A)' },
    //         {label: 'Product Type (A-Z)', value: 'Product Type (A-Z)'},
    //         {label: 'Product Type (Z-A)', value: 'Product Type (Z-A)'},
            
    //       ]}
    //       selected={sort || []}
    //       onChange={handleSortChange}
    //       // allowMultiple
    //     />
    //   ),
    //   shortcut: true,
    // },
  ]

  // Remove appliedFilters
  if (!isEmpty(vendor)) {
    const key = 'vendor';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, vendor),
      onRemove: handleVendorClear,
    });
  }

  if (!isEmpty(type)) {
    const key = 'type';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, type),
      onRemove: handleTypeClear,
    });
  }

  if (!isEmpty(tags)) {
    const key = 'tags';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, tags),
      onRemove: handleTagsClear,
    });
  }

  if (!isEmpty(sort)) {
    const key = 'sort';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, sort),
      onRemove: handleSortClear,
    });
  }
  
  return (
    <div className="App">
      <div className="product_list">
        <Page title="Product List">
          <Pagination                  
            // label={`page`}
            hasPrevious={prev}
            onPrevious={() => {
                // setPage(page-1)
                handlePrev()
            }}
            previousTooltip="Previous"
            nextTooltip="Next"
            hasNext={next}
            onNext={() => {
                // setPage(page+1)
                handleNext()
            }}
          />
          <br/>
            <Card>
              <Card.Section>
              <Filters
                
                    queryPlaceholder="Filter items"
                    queryValue={queryValue}
                    filters={filters}
                    appliedFilters={appliedFilters}
                    onQueryChange={(value) => handleFiltersQueryChange(value)}
                    onQueryClear={handleQueryValueRemove}
                    onClearAll={handleQueryValueRemove}
                />
             
              </Card.Section>
              <DataTable
              columnContentTypes={[
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                ]}
              headings={[
                <>
                  <Checkbox
                    label={count > 0 ? `${count} selected` : ''}
                    // id={product.id}
                    checked={checkAll}
                    onChange={handleCheckAll}
                  />
                </>  ,
                  'Title',
                  'Vendor',
                  'Product type',
                  'Tags',
                  'Action'
                  ]}
                rows={rows}
                sortable={[false,true, true, true, true]}
                defaultSortDirection="descending"
                initialSortColumnIndex={4}
                onSort={handleSort}
              />  
          </Card>
        </Page>  
      </div>
      
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
          <div style={{marginTop:10}}>
            <Button onClick={() => setShowDetail(!showDetail)}>Hide detail</Button>
          </div>
        </Page>
      }
    </div>
  );
  function sortArray(rows,index,direction) {
    console.log("rows", rows);
    return [...rows].sort((a,b) => {
      let aSort = '';
      let bSort = '';

      if (typeof a[index] === 'string' && typeof a[index] === 'string') {
       aSort = a[index].toLowerCase().substring(0,1);
       bSort = b[index].toLowerCase().substring(0,1);
      }
      else {
        aSort = a[index].props.children.toLowerCase().substring(0,1);
        bSort = b[index].props.children.toLowerCase().substring(0,1);
      }
      if (direction === 'descending') {
        return aSort < bSort ? 1 : -1;
      }
      else {
        return aSort > bSort ? 1 : -1;
      }
    })
  }
  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === '' || value == null;
    }
  }

  function disambiguateLabel(key, value) {
    switch (key) {
      case 'vendor':
        return `Vendor: ${value}`;
      case 'type':
        return `Product type: ${value}`;
      case 'tags':
        return `Tags with ${value}`;
      case 'sort':
          return `Sort by: ${value}`;
      default:
        return value;
    }
  }
  function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }
}

export default App;
