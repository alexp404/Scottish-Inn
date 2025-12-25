import React from 'react'

interface Props<T> {
  columns: { key: string; header: string; render?: (row: T) => React.ReactNode }[]
  data: T[]
}

export default function Table<T>({ columns, data }: Props<T>) {
  return (
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead>
        <tr style={{textAlign:'left',borderBottom:'1px solid #e5e7eb'}}>
          {columns.map(col => <th key={col.key}>{col.header}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={(row as any).id ?? i} style={{borderBottom:'1px solid #f3f4f6'}}>
            {columns.map(col => <td key={col.key as string}>{col.render ? col.render(row) : (row as any)[col.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
