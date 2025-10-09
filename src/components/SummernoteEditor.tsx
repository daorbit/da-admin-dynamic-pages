import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import ReactSummernoteLite from 'react-summernote-lite'
import 'react-summernote-lite/dist/font/summernote.ttf';
import 'react-summernote-lite/dist/summernote-lite.min.css';

interface SummernoteEditorProps {
  value?: string
  onChange: (content: string) => void
  placeholder?: string
  height?: number
}

export interface SummernoteEditorRef {
  getContent: () => string
}

const SummernoteEditor = forwardRef<SummernoteEditorRef, SummernoteEditorProps>(
  ({ value, onChange, placeholder = 'Enter content...', height = 300 }, ref) => {
    const editorRef = useRef<any>(null)

    useEffect(() => {
      if (editorRef.current && value !== undefined) {
        const currentContent = editorRef.current.summernote('code')
        if (currentContent !== value) {
          editorRef.current.summernote('code', value)
        }
      }
    }, [value])

    useImperativeHandle(ref, () => ({
      getContent: () => {
        if (editorRef.current) {
          return editorRef.current.summernote('code')
        }
        return value || ''
      }
    }))

    return (
      <ReactSummernoteLite
        ref={editorRef}
        options={{
          height: height,
          placeholder: placeholder,
          toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'underline', 'italic', 'strikethrough', 'superscript', 'subscript', 'clear']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video', 'hr']],
            ['view', ['fullscreen', 'codeview', 'help']]
          ],
          callbacks: {
            onInit: function() {
              if (value) {
                editorRef.current.summernote('code', value)
              }
            },
            onChange: function(contents: string) {
              console.log('Summernote onChange callback:', contents)
              onChange(contents)
            },
            onBlur: function() {
              const contents = editorRef.current.summernote('code')
              onChange(contents)
            }
          }
        }}
      />
    )
  }
)

SummernoteEditor.displayName = 'SummernoteEditor'

export default SummernoteEditor