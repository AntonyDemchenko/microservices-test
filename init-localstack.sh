#!/bin/bash
set -e

echo "🏁 Initializing LocalStack..."

# Створюємо тестову чергу 
awslocal sqs create-queue --queue-name test-queue

echo "✅ Queue 'test-queue' created successfully"
