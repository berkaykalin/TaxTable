import { useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {ColDef,CellKeyDownEvent,CellValueChangedEvent,ICellRendererParams,RowSelectedEvent} from "ag-grid-community";
import "./App.css";
import { observer } from "mobx-react-lite";
import taxStore from "./store/TaxStore";

const taxTypes = [
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

const App2: React.FC = observer(() => {
  const rowData = taxStore.rowData;
  const errorMessages = taxStore.errorMessages;

  const handleCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    const updatedData = [...taxStore.rowData];
    const rowIndex = event.rowIndex!;
    const field = event.colDef.field;
    const selectedTaxType = event.data.taxType;
    const newTckn = event.data.tckn;
    const newPrice = parseFloat(event.data.price.toString());
    const updatedErrors = [...taxStore.errorMessages];

    if (field === "tckn") {
      if (!/^\d{11}$/.test(newTckn.toString())) {
        updatedErrors.push({
          rowIndex,
          message:
            "TC Kimlik Numarası 11 haneli olmalıdır ve sadece sayılardan oluşmalıdır",
        });
        updatedData[rowIndex] = { ...updatedData[rowIndex], tckn: 0 };
      } else {
        updatedData[rowIndex] = { ...updatedData[rowIndex], tckn: newTckn };
      }
    } else if (field === "taxType") {
      if (taxDetails[selectedTaxType]) {
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          taxType: selectedTaxType,
          lastPaymentDate: taxDetails[selectedTaxType].lastPaymentDate,
        };
      } else {
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          taxType: "",
          lastPaymentDate: "",
        };
      }
    } else if (field === "price") {
      if (!/^\d{1,7}$/.test(newPrice.toString())) {
        updatedErrors.push({
          rowIndex,
          message: "Price alanı 7 basamaktan büyük olamaz",
        });
        updatedData[rowIndex] = { ...updatedData[rowIndex], price: 0 };
      } else {
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          price: newPrice,
          taxAmount: newPrice * 0.1,
          total: newPrice - newPrice * 0.1,
        };
      }
    }

    taxStore.setErrorMessages(updatedErrors);
    taxStore.setRowData(updatedData);
  }, []);

  const handleAddRow = () => {
    console.log("tıklandı addrow")
    const newRowData= {
      tckn: 0,
      taxType: "",
      price: 0,
      taxAmount: 0,
      lastPaymentDate: "",
      total: 0,
    };
  
    taxStore.addRow(newRowData);
  };

  const handleClearAll = () => {
    taxStore.clearAllRows();
  };

  const handleDeleteRow = useCallback((rowIndex: number) => {
    taxStore.deleteRow(rowIndex);
  }, []);

  const DeleteButtonRenderer = (props: ICellRendererParams) => {
    const handleClick = () => {
      console.log(props);
      const rowIndex = props.node!.rowIndex;
      if (rowIndex !== undefined && rowIndex !== null) {
        handleDeleteRow(rowIndex);
      }
    };

    return <button onClick={handleClick}>Delete Row</button>;
  };

  const handleCellKeyDown = (event: CellKeyDownEvent) => {
    const keyboardEvent = event.event as KeyboardEvent;
    const key = keyboardEvent.key;

    if (key === "Tab") {
      const columnId = event.column.getId();
      const rowIndex = event.rowIndex;
      const lastRowIndex = taxStore.rowData.length - 1;
      const lastColumnId = colDef[colDef.length - 1].field;

      if (rowIndex === lastRowIndex && columnId === lastColumnId) {
        handleAddRow();

        setTimeout(() => {
          const firstColumnKey = colDef[0].field;
          if (firstColumnKey) {
            event.api.startEditingCell({
              rowIndex: rowIndex + 1,
              colKey: firstColumnKey as string,
            });
          }

        }, 0);
      }
    }
  };
  const handleSaveTckn = async () => {
    try {
      const allTckn = rowData.map((row) => row.tckn);
      const response = await fetch("http://localhost:3001/api/save-tckn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(allTckn),
      });
      if (!response.ok) {
        throw new Error("Failed to save TCKNs");
      }
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while saving the TCKNs.");
    }
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
      filter: "agTextColumnFilter",
      filterParams: {
        textMatcher: (params: { value: string | number; filterText: string }): boolean => {
          return params.value.toString().startsWith(params.filterText);
        },
      },
    },
    {
      field: "taxType",
      headerName: "Tax Type",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: taxTypes,
      },
      editable: true,
      valueFormatter:(params)=>params.value ? params.value : "Select a Tax Type",
      filter: "agTextColumnFilter",
      filterParams: {
        textMatcher: (params: { value: string | number; filterText: string }): boolean => {
          return params.value.toString().startsWith(params.filterText);
        },
      },
    },
    {
      field: "price",
      headerName: "Price",
      valueFormatter: (params) =>
        params.value ? "£" + params.value.toLocaleString() : "",
      editable: true,
      filter: "agTextColumnFilter",
      filterParams: {
        textMatcher: (params: { value: string | number; filterText: string }): boolean => {
          return params.value.toString().startsWith(params.filterText);
        },
      },
      
    },
    {
      field: "taxAmount",
      headerName: "Tax Amount",
      valueFormatter: (p) => "£" + p.value.toLocaleString(),
      editable: false,
      filter: "agTextColumnFilter",
      filterParams: {
        textMatcher: (params: { value: string | number; filterText: string }): boolean => {
          return params.value.toString().startsWith(params.filterText);
        },
      },
    },
    {
      field: "lastPaymentDate",
      headerName: "Last Payment Date",
      editable: false,
      filter: "agTextColumnFilter",
      filterParams: {
        textMatcher: (params: { value: string | number; filterText: string }): boolean => {
          return params.value.toString().startsWith(params.filterText);
        },
      },
    },
    {
      field: "total",
      headerName: "Total",
      valueFormatter: (p) => "£" + p.value.toLocaleString(),
      editable: false,
      filter: "agTextColumnFilter",
      filterParams: {
        textMatcher: (params: { value: string | number; filterText: string }): boolean => {
          return params.value.toString().startsWith(params.filterText);
        },
      },
    },
    {
      field: "delete",
      headerName: "Delete",
      editable: false,
      cellRenderer: DeleteButtonRenderer,
    },
  ];
  
  const handleRowSelected = (event: RowSelectedEvent) => {
    const selectedRowData = event.node.data;
    taxStore.setSelectedRowData(selectedRowData);
    console.log("Selected Row Data:", taxStore.selectedRowData);
  };

  return (
    <div style={{ position: "relative", height: 500, width: "100%" }}>
      <div
        className="ag-theme-quartz"
        style={{ height: "calc(100% - 150px)", width: "100%" }}
      >
        <AgGridReact
          rowData={taxStore.rowData.slice()}
          columnDefs={colDef}
          rowSelection="single"
          defaultColDef={{
            flex: 1,
            editable: true,
            filter: true,
            floatingFilter: true,
          }}
          onCellKeyDown={handleCellKeyDown}
          onCellValueChanged={handleCellValueChanged}
          onRowSelected={handleRowSelected}
        />
      </div>
      <div className="error-container">
        {errorMessages.map((error, index) => (
          <div key={index} className="error-message">
            ⚠️ Satır {error.rowIndex + 1}: {error.message}
          </div>
        ))}
      </div>
      <div className="button-container">
        <button onClick={handleAddRow}>Add Row</button>
        <button onClick={handleSaveJson}>Save Json</button>
        <button onClick={handleClearAll}>Clear All</button>
        <button onClick={handleSaveTckn}>Save TCKN</button>
      </div>
    </div>
  );
});

export default App2;
