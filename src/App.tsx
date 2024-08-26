import { useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, CellValueChangedEvent,ICellRendererParams } from "ag-grid-community";
import "./App.css";

interface TaxData {
  tckn: number;
  taxType: string;
  price: number;
  taxAmount: number;
  lastPaymentDate: string;
  total: number;
}

const taxTypes = [
  "Select a Tax Type",
  "Income Tax",
  "Sales Tax",
  "Property Tax",
  "Corporate Tax",
  "Luxury Tax",
  "Excise Tax",
];

const taxDetails: Record<string, { lastPaymentDate: string }> = {
  "Income Tax": { lastPaymentDate: "11/12/2024" },
  "Sales Tax": { lastPaymentDate: "12/11/2024" },
  "Property Tax": { lastPaymentDate: "09/09/2024" },
  "Corporate Tax": { lastPaymentDate: "10/12/2024" },
  "Luxury Tax": { lastPaymentDate: "27/10/2024" },
  "Excise Tax": { lastPaymentDate: "16/09/2024" },
};

function App() {
  const [rowData, setRowData] = useState<TaxData[]>([
    {
      tckn: 0,
      taxType: "Select a Tax Type",
      price: 0,
      taxAmount: 0,
      lastPaymentDate: "",
      total: 0,
    },
  ]);

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent) => {
      setRowData((prevRowData) => {
        const updatedData = [...prevRowData];
        const rowIndex = event.rowIndex?? -1;
        const field = event.colDef.field as keyof TaxData;
        const selectedTaxType = event.data.taxType;
        const newPrice = parseFloat(event.data.price.toString());

        if (field === "taxType") {
          if (taxDetails[selectedTaxType]) {
            updatedData[rowIndex] = {
              ...updatedData[rowIndex],
              taxType: selectedTaxType,
              lastPaymentDate: taxDetails[selectedTaxType].lastPaymentDate,
            };
          } else {
            updatedData[rowIndex] = {
              ...updatedData[rowIndex],
              taxType: "Select a Tax Type",
              lastPaymentDate: "",
            };
          }
        } else if (field === "price") {
          updatedData[rowIndex] = {
            ...updatedData[rowIndex],
            price: newPrice,
            taxAmount: newPrice * 0.1,
          };
        }

        return updatedData;
      });
    },
    []
  );
  const handleDeleteRow = useCallback((rowIndex: number) => {
    setRowData((prevRowData) => {
      const updatedData = prevRowData.filter((_, index) => index !== rowIndex);
      return updatedData;
    });
  }, []);

  const DeleteButtonRenderer = (props: ICellRendererParams) => {
    const handleClick = () => {
      console.log(props)
      const rowIndex = props.node!.rowIndex;
      if (rowIndex!==undefined && rowIndex!==null) {
        handleDeleteRow(rowIndex);
      } 
    };
  
    return <button onClick={handleClick}>Delete Row</button>;
  };
  
  const handleClearAll = () => {
    setRowData([]);
  };

  const handleAddRow = () => {
    setRowData((prevRowData) => {
      const newRowData = [
        ...prevRowData,
        {
          tckn: 0,
          taxType: "Select a Tax Type",
          price: 0,
          taxAmount: 0,
          lastPaymentDate: "",
          total: 0,
        },
      ];
      return newRowData;
    });
  };

  const handleSaveJson = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/save-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rowData),
      });
      if (!response.ok) {
        throw new Error("Failed to save JSON");
      }

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while saving the JSON.");
    }
  };

  
  const colDef: ColDef[] = [
    {
      field: "tckn",
      headerName: "TCKN",
      editable: true,
    },
    {
      field: "taxType",
      headerName: "Tax Type",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: taxTypes,
      },
      editable: true,
    },
    {
      field: "price",
      headerName: "Price",
      valueFormatter: (params) =>
        params.value ? "£" + params.value.toLocaleString() : "",
      editable: true,
    },
    {
      field: "taxAmount",
      headerName: "Tax Amount",
      valueFormatter: (params) =>
        params.value ? "£" + params.value.toLocaleString() : "",
      editable: false,
    },
    {
      field: "lastPaymentDate",
      headerName: "Last Payment Date",
      editable: false,
    },
    {
      field:"delete",
      headerName:"Delete",
      editable:false,
      cellRenderer: DeleteButtonRenderer
    }
  ];

  return (
    <div style={{ position: "relative", height: 500, width: "100%" }}>
      <div
        className="ag-theme-quartz"
        style={{ height: "calc(100% - 150px)", width: "100%" }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={colDef}
          defaultColDef={{
            flex: 1,
            editable: true,
            filter: true,
            floatingFilter: true,
          }}
          onCellValueChanged={handleCellValueChanged}
        />
      </div>
      <button onClick={handleAddRow}>Add Row</button>
      <button onClick={handleSaveJson}>Save Json</button>
      <button onClick={handleClearAll}></button>
    </div>
  );
}

export default App;
