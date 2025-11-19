export default function FileUploader({ onUpload }) {
  return <input type="file" multiple onChange={(e) => onUpload(Array.from(e.target.files))} />;
}