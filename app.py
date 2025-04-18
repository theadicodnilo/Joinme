from flask import Flask, request, jsonify, make_response, Response
from flask_cors import CORS
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import base64
import json
import traceback
import os

app = Flask(__name__)
CORS(app)

# Error handler for all exceptions
@app.errorhandler(Exception)
def handle_error(error):
    print(f"Error: {str(error)}")
    print(traceback.format_exc())
    return make_response(
        jsonify({
            'status': 'error',
            'error': str(error)
        }), 500
    )

# Configure Generative AI
API_KEY = 'AIzaSyANAG9la9ReIBudxIEQ2ULoWwaHehPXKPE'
client = genai.Client(api_key=API_KEY)

# Chat history storage
chat_sessions = {}

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json(force=True)
        message = data.get('message', '')
        session_id = data.get('session_id', '')
        stream = data.get('stream', False)
        
        if not message:
            return jsonify({'status': 'error', 'error': 'Message is required'}), 400

        # Get or create chat session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = client.chats.create(model="gemini-2.0-flash")
        
        chat = chat_sessions[session_id]

        try:
            if stream:
                # Streaming response
                def generate():
                    response = chat.send_message_stream(message)
                    for chunk in response:
                        yield f"data: {json.dumps({'text': chunk.text})}\n\n"
                
                return app.response_class(generate(), mimetype='text/event-stream')
            else:
                # Regular response
                response = chat.send_message(message)
                return jsonify({
                    'status': 'success',
                    'response': response.text,
                    'history': [
                        {'role': msg.role, 'text': msg.parts[0].text}
                        for msg in chat.get_history()
                    ]
                })

        except Exception as api_error:
            print(f"API error: {str(api_error)}")
            return jsonify({
                'status': 'error',
                'error': f'Generation failed: {str(api_error)}'
            }), 500

    except Exception as e:
        print(f"General error: {str(e)}")
        return jsonify({'status': 'error', 'error': str(e)}), 500

@app.route('/chat/image', methods=['POST'])
def image_chat():
    try:
        if 'image' not in request.files:
            return jsonify({'status': 'error', 'error': 'No image provided'}), 400
            
        image_file = request.files['image']
        prompt = request.form.get('prompt', '')
        
        # Process image with PIL
        image = Image.open(image_file)
        
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[prompt, image]
            )
            
            return jsonify({
                'status': 'success',
                'response': response.text
            })
            
        except Exception as api_error:
            print(f"API error: {str(api_error)}")
            return jsonify({
                'status': 'error',
                'error': f'Image analysis failed: {str(api_error)}'
            }), 500
            
    except Exception as e:
        print(f"General error: {str(e)}")
        return jsonify({'status': 'error', 'error': str(e)}), 500

@app.route('/generate/image', methods=['POST'])
def generate_image():
    try:
        data = request.get_json(force=True)
        prompt = data.get('prompt', '')
        
        if not prompt:
            return jsonify({
                'status': 'error',
                'error': 'Prompt is required'
            }), 400
            
        # Instead of generating image, provide helpful suggestions
        image_sources = {
            'search_engines': [
                {'name': 'Google Images', 'url': 'https://images.google.com'},
                {'name': 'Bing Images', 'url': 'https://www.bing.com/images'},
                {'name': 'DuckDuckGo Images', 'url': 'https://duckduckgo.com/?t=h_&iax=images&ia=images'}
            ],
            'stock_photos': [
                {'name': 'Unsplash', 'url': 'https://unsplash.com', 'type': 'Free'},
                {'name': 'Pexels', 'url': 'https://pexels.com', 'type': 'Free'},
                {'name': 'Pixabay', 'url': 'https://pixabay.com', 'type': 'Free'},
                {'name': 'Shutterstock', 'url': 'https://shutterstock.com', 'type': 'Paid'},
                {'name': 'Getty Images', 'url': 'https://gettyimages.com', 'type': 'Paid'}
            ],
            'ai_generators': [
                {'name': 'DALL-E 2', 'url': 'https://labs.openai.com', 'type': 'Paid'},
                {'name': 'Midjourney', 'url': 'https://midjourney.com', 'type': 'Subscription'},
                {'name': 'Craiyon', 'url': 'https://craiyon.com', 'type': 'Free'}
            ]
        }
        
        return jsonify({
            'status': 'info',
            'message': 'Direct image generation is not available',
            'alternatives': {
                'description': 'Here are some alternative sources for finding images:',
                'sources': image_sources
            },
            'search_tips': {
                'keywords': f"Try searching for: {prompt}",
                'refinements': 'You can refine your search by adding specifics about style, color, or composition'
            }
        })
            
    except Exception as e:
        print(f"Error handling image generation request: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': 'Failed to process image generation request'
        }), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'error': 'No file provided'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'error': 'No file selected'}), 400

        # Read the file and convert to base64
        file_data = base64.b64encode(file.read()).decode('utf-8')
        
        return jsonify({
            'status': 'success',
            'file_data': f'data:{file.content_type};base64,{file_data}'
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
