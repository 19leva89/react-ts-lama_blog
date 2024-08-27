import React, { useMemo } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const TinyMCEEditor = ({ value, onChange, initOptions }) => {
	const editorConfig = useMemo(() => ({
		height: 500,
		menubar: false,
		plugins: [
			'advlist autolink lists link image charmap print preview anchor',
			'searchreplace visualblocks code fullscreen',
			'insertdatetime media table paste code help wordcount'
		],
		toolbar:
			'undo redo | formatselect | bold italic backcolor | ' +
			'alignleft aligncenter alignright alignjustify | ' +
			'bullist numlist outdent indent | removeformat | help',
		...initOptions
	}), [initOptions]);

	return (
		<Editor
			apiKey={process.env.REACT_APP_TINYMCE_API_KEY || 'no-api-key'} // Используйте REACT_APP_ для переменных окружения в React
			value={value}
			init={editorConfig}
			onEditorChange={(content) => onChange(content)}
		/>
	);
};

export default TinyMCEEditor;
