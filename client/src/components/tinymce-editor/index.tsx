import { FC, useMemo } from 'react'
import { Editor } from '@tinymce/tinymce-react'

type Props = {
	value: string
	onChange: (content: string) => void
	initOptions: object
}

const TinyMCEEditor: FC<Props> = ({ value, onChange, initOptions }) => {
	const editorConfig = useMemo(
		() => ({
			height: 500,
			menubar: false,
			plugins: [
				'advlist autolink lists link image charmap print preview anchor',
				'searchreplace visualblocks code fullscreen',
				'insertdatetime media table paste code help wordcount',
			],
			toolbar:
				'undo redo | formatselect | bold italic backcolor | ' +
				'alignleft aligncenter alignright alignjustify | ' +
				'bullist numlist outdent indent | removeformat | help',
			...initOptions,
		}),
		[initOptions],
	)

	return (
		<Editor
			apiKey={process.env.REACT_APP_TINYMCE_API_KEY || 'no-api-key'}
			value={value}
			init={editorConfig}
			onEditorChange={(content) => onChange(content)}
		/>
	)
}

export default TinyMCEEditor
